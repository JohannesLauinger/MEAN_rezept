/*
 * Copyright (C) 2018 - present Juergen Zimmermann, Hochschule Karlsruhe
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
 * Das Modul enthält die _Resolver_ für GraphQL.
 *
 * Die Referenzimplementierung von GraphQL soll übrigens nach TypeScript
 * migriert werden: https://github.com/graphql/graphql-js/issues/2860
 * @packageDocumentation
 */

import {
    RezeptInvalid,
    RezeptNotExists,
    NameExists,
    VersionInvalid,
    VersionOutdated,
} from './../service/errors';
import { RezeptService, RezeptServiceError } from '../service';
import type { rezept } from './../entity';
import { logger } from '../../shared';

const rezeptService = new RezeptService();

// https://www.apollographql.com/docs/apollo-server/data/resolvers
// Zugriff auf Header-Daten, z.B. Token
// https://www.apollographql.com/docs/apollo-server/migration-two-dot/#accessing-request-headers
// https://www.apollographql.com/docs/apollo-server/security/authentication

// Resultat mit id (statt _id) und version (statt __v)
// __ ist bei GraphQL fuer interne Zwecke reserviert
const withIdAndVersion = (rezept: rezept) => {
    const result: any = rezept;
    result.id = rezept._id;
    result.version = rezept.__v;
    return rezept;
};

const findRezeptById = async (id: string) => {
    const rezept = await rezeptService.findById(id);
    if (rezept === undefined) {
        return;
    }
    return withIdAndVersion(rezept);
};

const findRezepte = async (name: string | undefined) => {
    const suchkriterium = name === undefined ? {} : { name };
    const rezepte = await rezeptService.find(suchkriterium);
    return rezepte.map((rezept: rezept) => withIdAndVersion(rezept));
};

interface NameCriteria {
    name: string;
}

interface IdCriteria {
    id: string;
}

const createRezept = async (rezept: rezept) => {
    rezept.datum = new Date(rezept.datum as string);
    const result = await rezeptService.create(rezept);
    logger.debug('resolvers createRezept(): result=%o', result);
    if (result instanceof RezeptServiceError) {
        return;
    }
    return result;
};

const logUpdateResult = (
    result:
        | RezeptInvalid
        | RezeptNotExists
        | NameExists
        | VersionInvalid
        | VersionOutdated
        | number,
) => {
    if (result instanceof RezeptInvalid) {
        logger.debug('resolvers updateRezept(): validation msg = %o', result.msg);
    } else if (result instanceof NameExists) {
        logger.debug(
            'resolvers updateRezept(): vorhandener name = %s',
            result.name,
        );
    } else if (result instanceof RezeptNotExists) {
        logger.debug(
            'resolvers updateRezept(): nicht-vorhandene id = %s',
            result.id,
        );
    } else if (result instanceof VersionInvalid) {
        logger.debug(
            'resolvers updateRezept(): ungueltige version = %d',
            result.version,
        );
    } else if (result instanceof VersionOutdated) {
        logger.debug(
            'resolvers updateRezept(): alte version = %d',
            result.version,
        );
    } else {
        logger.debug(
            'resolvers updateRezept(): aktualisierte Version= %d',
            result,
        );
    }
};

const updateRezept = async (rezept: rezept) => {
    logger.debug(
        'resolvers updateRezept(): zu aktualisieren = %s',
        JSON.stringify(rezept),
    );
    const version = rezept.__v ?? 0;
    rezept.datum = new Date(rezept.datum as string);
    const result = await rezeptService.update(rezept, version.toString());
    logUpdateResult(result);
    return result;
};

const deleteRezept = async (id: string) => {
    const result = await rezeptService.delete(id);
    logger.debug('resolvers deleteRezept(): result = %s', result);
    return result;
};

// Queries passend zu "type Query" in typeDefs.ts
const query = {
    /**
     * Bücher suchen
     * @param _ nicht benutzt
     * @param __namedParameters JSON-Objekt mit `name` als Suchkriterium
     * @returns Promise mit einem JSON-Array der gefundenen Bücher
     */
    rezepte: (_: unknown, { name }: NameCriteria) => findRezepte(name),

    /**
     * rezept suchen
     * @param _ nicht benutzt
     * @param __namedParameters JSON-Objekt mit `id` als Suchkriterium
     * @returns Promise mit dem gefundenen {@linkcode rezept} oder `undefined`
     */
    rezept: (_: unknown, { id }: IdCriteria) => findRezeptById(id),
};

const mutation = {
    /**
     * Neues rezept anlegen
     * @param _ nicht benutzt
     * @param rezept JSON-Objekt mit dem neuen {@linkcode rezept}
     * @returns Promise mit der generierten ID
     */
    createRezept: (_: unknown, rezept: rezept) => createRezept(rezept),

    /**
     * Vorhandenes {@linkcode rezept} aktualisieren
     * @param _ nicht benutzt
     * @param rezept JSON-Objekt mit dem zu aktualisierenden rezept
     * @returns Das aktualisierte rezept als {@linkcode RezeptData} in einem Promise,
     * falls kein Fehler aufgetreten ist. Ansonsten ein Promise mit einem Fehler
     * durch:
     * - {@linkcode RezeptInvalid}
     * - {@linkcode RezeptNotExists}
     * - {@linkcode NameExists}
     * - {@linkcode VersionInvalid}
     * - {@linkcode VersionOutdated}
     */
    updateRezept: (_: unknown, rezept: rezept) => updateRezept(rezept),

    /**
     * rezept löschen
     * @param _ nicht benutzt
     * @param __namedParameters JSON-Objekt mit `id` zur Identifikation
     * @returns true, falls das rezept gelöscht wurde. Sonst false.
     */
    deleteRezept: (_: unknown, { id }: IdCriteria) => deleteRezept(id),
};

/**
 * Die Resolver bestehen aus `Query` und `Mutation`.
 */
export const resolvers /* : IResolvers */ = {
    Query: query, // eslint-disable-line @typescript-eslint/naming-convention
    Mutation: mutation, // eslint-disable-line @typescript-eslint/naming-convention
};
