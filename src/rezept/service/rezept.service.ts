/* eslint-disable max-lines */
/*
 * Copyright (C) 2016 - present Juergen Zimmermann, Hochschule Karlsruhe
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Das Modul besteht aus der Klasse {@linkcode AuthService} für die
 * Authentifizierung.
 * @packageDocumentation
 */

import type { rezept, RezeptData } from '../entity';
import {
    RezeptInvalid,
    RezeptNotExists,
    RezeptServiceError,
    HinweisExists,
    NameExists,
    VersionInvalid,
    VersionOutdated,
} from './errors';
import { RezeptModel, validateRezept } from '../entity';
import { cloud, logger, mailConfig } from '../../shared';
import type { QueryOptions } from 'mongoose';
import type { SendMailOptions } from 'nodemailer';

// API-Dokumentation zu Mongoose:
// http://mongoosejs.com/docs/api.html
// https://github.com/Automattic/mongoose/issues/3949

/* eslint-disable no-null/no-null, unicorn/no-useless-undefined, @typescript-eslint/no-unsafe-assignment */

/**
 * Die Klasse `RezeptService` implementiert den Anwendungskern für Bücher und
 * greift mit _Mongoose_ auf MongoDB zu.
 */
export class RezeptService {
    private static readonly UPDATE_OPTIONS: QueryOptions = { new: true };

    // Rueckgabetyp Promise bei asynchronen Funktionen
    //    ab ES2015
    //    vergleiche Task<> bei C# und Mono<> aus Project Reactor
    // Status eines Promise:
    //    Pending: das Resultat ist noch nicht vorhanden, weil die asynchrone
    //             Operation noch nicht abgeschlossen ist
    //    Fulfilled: die asynchrone Operation ist abgeschlossen und
    //               das Promise-Objekt hat einen Wert
    //    Rejected: die asynchrone Operation ist fehlgeschlagen and das
    //              Promise-Objekt wird nicht den Status "fulfilled" erreichen.
    //              Im Promise-Objekt ist dann die Fehlerursache enthalten.

    /**
     * Ein rezept asynchron anhand seiner ID suchen
     * @param id ID des gesuchten Rezeptes
     * @returns Das gefundene rezept vom Typ {@linkcode RezeptData} oder undefined
     */
    async findById(id: string) {
        logger.debug('RezeptService.findById(): id=%s', id);

        // ein rezept zur gegebenen ID asynchron mit Mongoose suchen
        // Pattern "Active Record" (urspruengl. von Ruby-on-Rails)
        // Das Resultat ist null, falls nicht gefunden.
        // lean() liefert ein "Plain JavaScript Object" statt ein Mongoose Document,
        // so dass u.a. der virtuelle getter "id" auch nicht mehr vorhanden ist.
        const rezept = await RezeptModel.findById(id).lean<RezeptData | null>();
        logger.debug('RezeptService.findById(): rezept=%o', rezept);

        if (rezept === null) {
            return undefined;
        }

        this.deleteTimestamps(rezept);
        return rezept;
    }

    /**
     * Bücher asynchron suchen.
     * @param query Die DB-Query als JSON-Objekt
     * @returns Ein JSON-Array mit den gefundenen Büchern. Ggf. ist das Array leer.
     */
    // eslint-disable-next-line max-lines-per-function
    async find(query?: any | undefined) {
        logger.debug('RezeptService.find(): query=%o', query);

        // alle Rezepte asynchron suchen u. aufsteigend nach name sortieren
        // https://docs.mongodb.org/manual/reference/object-id
        // entries(): { name: 'a', schwierigkeit: 5 } => [{ name: 'x'}, {schwierigkeit: 5}]
        if (query === undefined || Object.entries(query).length === 0) {
            logger.debug('RezeptService.find(): alle Rezepte');
            // lean() liefert ein "Plain JavaScript Object" statt ein Mongoose Document
            const rezepte = await RezeptModel.find()
                .sort('name')
                .lean<RezeptData[]>();
            for await (const rezept of rezepte) {
                this.deleteTimestamps(rezept);
            }
            return rezepte;
        }

        // { name: 'a', schwierigkeit: 5, javascript: true }
        // Rest Properties
        const { name, javascript, typescript, ...dbQuery } = query;

        // Rezepte zur Query (= JSON-Objekt durch Express) asynchron suchen
        // Name in der Query: Teilstring des Names,
        // d.h. "LIKE" als regulaerer Ausdruck
        // 'i': keine Unterscheidung zw. Gross- u. Kleinschreibung
        // NICHT /.../, weil das Muster variabel sein muss
        // CAVEAT: KEINE SEHR LANGEN Strings wg. regulaerem Ausdruck
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (name !== undefined && name.length < 10) {
            // RegExp statt Re2 wegen Mongoose
            dbQuery.name = new RegExp(name, 'iu'); // eslint-disable-line security/detect-non-literal-regexp, security-node/non-literal-reg-expr
        }

        // z.B. {javascript: true, typescript: true}
        const zutaten = [];
        if (javascript === 'true') {
            zutaten.push('JAVASCRIPT');
        }
        if (typescript === 'true') {
            zutaten.push('TYPESCRIPT');
        }
        if (zutaten.length === 0) {
            delete dbQuery.zutaten;
        } else {
            dbQuery.zutaten = zutaten;
        }

        logger.debug('RezeptService.find(): dbQuery=%o', dbQuery);

        // Pattern "Active Record" (urspruengl. von Ruby-on-Rails)
        // leeres Array, falls nichts gefunden wird
        // RezeptModel.findOne(query), falls das Suchkriterium eindeutig ist
        // bei findOne(query) wird null zurueckgeliefert, falls nichts gefunden
        // lean() liefert ein "Plain JavaScript Object" statt ein Mongoose Document
        const rezepte = await RezeptModel.find(dbQuery).lean<RezeptData[]>();
        for await (const rezept of rezepte) {
            this.deleteTimestamps(rezept);
        }

        return rezepte;
    }

    /**
     * Ein neues rezept soll angelegt werden.
     * @param rezept Das neu abzulegende rezept
     * @returns Die ID des neu angelegten Rezeptes oder im Fehlerfall
     * - {@linkcode RezeptInvalid} falls die Rezeptdaten gegen Constraints verstoßen
     * - {@linkcode HinweisExists} falls die ISBN-Nr bereits existiert
     * - {@linkcode NameExists} falls der Name bereits existiert
     */
    async create(
        rezept: rezept,
    ): Promise<RezeptInvalid | HinweisExists | NameExists | string> {
        logger.debug('RezeptService.create(): rezept=%o', rezept);
        const validateResult = await this.validateCreate(rezept);
        if (validateResult instanceof RezeptServiceError) {
            return validateResult;
        }

        const rezeptModel = new RezeptModel(rezept);
        const saved = await rezeptModel.save();
        const id = saved._id as string; // eslint-disable-line @typescript-eslint/non-nullable-type-assertion-style
        logger.debug('RezeptService.create(): id=%s', id);

        await this.sendmail(rezept);

        return id;
    }

    /**
     * Ein vorhandenes rezept soll aktualisiert werden.
     * @param rezept Das zu aktualisierende rezept
     * @param versionStr Die Versionsnummer für optimistische Synchronisation
     * @returns Die neue Versionsnummer gemäß optimistischer Synchronisation
     *  oder im Fehlerfall
     *  - {@linkcode RezeptInvalid}, falls Constraints verletzt sind
     *  - {@linkcode RezeptNotExists}, falls das rezept nicht existiert
     *  - {@linkcode NameExists}, falls der Name bereits existiert
     *  - {@linkcode VersionInvalid}, falls die Versionsnummer ungültig ist
     *  - {@linkcode VersionOutdated}, falls die Versionsnummer nicht aktuell ist
     */
    async update(
        rezept: rezept,
        versionStr: string,
    ): Promise<
        | RezeptInvalid
        | RezeptNotExists
        | NameExists
        | VersionInvalid
        | VersionOutdated
        | number
    > {
        logger.debug('RezeptService.update(): rezept=%o', rezept);
        logger.debug('RezeptService.update(): versionStr=%s', versionStr);

        const validateResult = await this.validateUpdate(rezept, versionStr);
        if (validateResult instanceof RezeptServiceError) {
            return validateResult;
        }

        // findByIdAndReplace ersetzt ein Document mit ggf. weniger Properties
        const rezeptModel = new RezeptModel(rezept);
        // Weitere Methoden zum Aktualisieren:
        //    rezept.findOneAndUpdate(update)
        //    rezept.updateOne(bedingung)
        const updated = await RezeptModel.findByIdAndUpdate(
            rezept._id,
            rezeptModel,
            RezeptService.UPDATE_OPTIONS,
        ).lean<RezeptData | null>();
        if (updated === null) {
            return new RezeptNotExists(rezept._id);
        }

        const version = updated.__v as number; // eslint-disable-line @typescript-eslint/non-nullable-type-assertion-style
        logger.debug('RezeptService.update(): version=%d', version);

        return Promise.resolve(version);
    }

    /**
     * Ein rezept wird asynchron anhand seiner ID gelöscht.
     *
     * @param id ID des zu löschenden Rezeptes
     * @returns true, falls das rezept vorhanden war und gelöscht wurde. Sonst false.
     */
    async delete(id: string) {
        logger.debug('RezeptService.delete(): id=%s', id);

        // Das rezept zur gegebenen ID asynchron loeschen
        const deleted = await RezeptModel.findByIdAndDelete(id).lean();
        logger.debug('RezeptService.delete(): deleted=%o', deleted);
        return deleted !== null;

        // Weitere Methoden von mongoose, um zu loeschen:
        //  rezept.findByIdAndRemove(id)
        //  rezept.findOneAndRemove(bedingung)
    }

    private deleteTimestamps(rezept: RezeptData) {
        delete rezept.createdAt;
        delete rezept.updatedAt;
    }

    private async validateCreate(rezept: rezept) {
        const msg = validateRezept(rezept);
        if (msg !== undefined) {
            logger.debug(
                'RezeptService.validateCreate(): Validation Message: %o',
                msg,
            );
            return new RezeptInvalid(msg);
        }

        // statt 2 sequentiellen DB-Zugriffen waere 1 DB-Zugriff mit OR besser

        const { name } = rezept;
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        if (await RezeptModel.exists({ name })) {
            return new NameExists(name);
        }

        const { hinweis } = rezept;
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        if (await RezeptModel.exists({ hinweis })) {
            return new HinweisExists(hinweis);
        }

        logger.debug('RezeptService.validateCreate(): ok');
        return undefined;
    }

    private async sendmail(rezept: rezept) {
        if (cloud !== undefined || mailConfig.host === 'skip') {
            // In der Cloud kann man z.B. "@sendgrid/mail" statt
            // "nodemailer" mit lokalem Mailserver verwenden
            return;
        }

        const from = '"Joe Doe" <Joe.Doe@acme.com>';
        const to = '"Foo Bar" <Foo.Bar@acme.com>';
        const subject = `Neues rezept ${rezept._id}`;
        const body = `Das rezept mit dem Name <strong>${rezept.name}</strong> ist angelegt`;

        const data: SendMailOptions = { from, to, subject, html: body };
        logger.debug('sendMail(): data=%o', data);

        try {
            const nodemailer = await import('nodemailer'); // eslint-disable-line node/no-unsupported-features/es-syntax
            await nodemailer.createTransport(mailConfig).sendMail(data);
        } catch (err: unknown) {
            logger.error(
                'RezeptService.create(): Fehler beim Verschicken der Email: %o',
                err,
            );
        }
    }

    private async validateUpdate(rezept: rezept, versionStr: string) {
        const result = this.validateVersion(versionStr);
        if (typeof result !== 'number') {
            return result;
        }

        const version = result;
        logger.debug('RezeptService.validateUpdate(): version=%d', version);
        logger.debug('RezeptService.validateUpdate(): rezept=%o', rezept);

        const validationMsg = validateRezept(rezept);
        if (validationMsg !== undefined) {
            return new RezeptInvalid(validationMsg);
        }

        const resultName = await this.checkNameExists(rezept);
        if (resultName !== undefined && resultName.id !== rezept._id) {
            return resultName;
        }

        if (rezept._id === undefined) {
            return new RezeptNotExists(undefined);
        }

        const resultIdAndVersion = await this.checkIdAndVersion(
            rezept._id,
            version,
        );
        if (resultIdAndVersion !== undefined) {
            return resultIdAndVersion;
        }

        logger.debug('RezeptService.validateUpdate(): ok');
        return undefined;
    }

    private validateVersion(versionStr: string | undefined) {
        if (versionStr === undefined) {
            const error = new VersionInvalid(versionStr);
            logger.debug(
                'RezeptService.validateVersion(): VersionInvalid=%o',
                error,
            );
            return error;
        }

        const version = Number.parseInt(versionStr, 10);
        if (Number.isNaN(version)) {
            const error = new VersionInvalid(versionStr);
            logger.debug(
                'RezeptService.validateVersion(): VersionInvalid=%o',
                error,
            );
            return error;
        }

        return version;
    }

    private async checkNameExists(rezept: rezept) {
        const { name } = rezept;

        // Pattern "Active Record" (urspruengl. von Ruby-on-Rails)
        const result = await RezeptModel.findOne({ name }, { _id: true }).lean();
        if (result !== null) {
            const id = result._id;
            logger.debug('RezeptService.checkNameExists(): _id=%s', id);
            return new NameExists(name, id);
        }

        logger.debug('RezeptService.checkNameExists(): ok');
        return undefined;
    }

    private async checkIdAndVersion(id: string, version: number) {
        const rezeptDb: RezeptData | null = await RezeptModel.findById(id).lean();
        if (rezeptDb === null) {
            const result = new RezeptNotExists(id);
            logger.debug(
                'RezeptService.checkIdAndVersion(): RezeptNotExists=%o',
                result,
            );
            return result;
        }

        // nullish coalescing
        const versionDb = rezeptDb.__v ?? 0;
        if (version < versionDb) {
            const result = new VersionOutdated(id, version);
            logger.debug(
                'RezeptService.checkIdAndVersion(): VersionOutdated=%o',
                result,
            );
            return result;
        }

        return undefined;
    }
}
/* eslint-enable no-null/no-null, unicorn/no-useless-undefined, @typescript-eslint/no-unsafe-assignment */
/* eslint-enable max-lines */
