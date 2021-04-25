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
 * Das Modul besteht aus den Klassen für die Fehlerbehandlung bei der Verwaltung
 * von Büchern, z.B. beim DB-Zugriff.
 * @packageDocumentation
 */

/* eslint-disable max-classes-per-file */

import type { ValidationErrorMsg } from './../entity';

/**
 * Allgemeine Basisklasse für {@linkcode RezeptService}
 */
export class RezeptServiceError {} // eslint-disable-line @typescript-eslint/no-extraneous-class

/**
 * Klasse für fehlerhafte Rezeptdaten. Die Meldungstexte sind in der Property
 * `msg` gekapselt.
 */
export class RezeptInvalid extends RezeptServiceError {
    constructor(readonly msg: ValidationErrorMsg) {
        super();
    }
}

/**
 * Klasse für einen bereits existierenden Name.
 */
export class NameExists extends RezeptServiceError {
    constructor(
        readonly name: string | null | undefined,
        readonly id?: string,
    ) {
        super();
    }
}

/**
 * Klasse für eine bereits existierende ISBN-Nummer.
 */
export class HinweisExists extends RezeptServiceError {
    constructor(
        readonly hinweis: string | null | undefined,
        readonly id?: string,
    ) {
        super();
    }
}

/**
 * Union-Type für Fehler beim Neuanlegen eines Rezeptes.
 */
export type CreateError = RezeptInvalid | HinweisExists | NameExists;

/**
 * Klasse für eine ungültige Versionsnummer beim Ändern.
 */
export class VersionInvalid extends RezeptServiceError {
    constructor(readonly version: string | undefined) {
        super();
    }
}

/**
 * Klasse für eine veraltete Versionsnummer beim Ändern.
 */
export class VersionOutdated extends RezeptServiceError {
    constructor(readonly id: string, readonly version: number) {
        super();
    }
}

/**
 * Klasse für ein nicht-vorhandenes rezept beim Ändern.
 */
export class RezeptNotExists extends RezeptServiceError {
    constructor(readonly id: string | undefined) {
        super();
    }
}

/**
 * Union-Type für Fehler beim Ändern eines Rezeptes.
 */
export type UpdateError =
    | RezeptInvalid
    | RezeptNotExists
    | NameExists
    | VersionInvalid
    | VersionOutdated;

/**
 * Allgemeine Basisklasse für {@linkcode RezeptFileService}
 */
export class RezeptFileServiceError {} // eslint-disable-line @typescript-eslint/no-extraneous-class

/**
 * Klasse für eine nicht-vorhandenes Binärdatei.
 */
export class FileNotFound extends RezeptFileServiceError {
    constructor(readonly filename: string) {
        super();
    }
}

/**
 * Klasse, falls es mehrere Binärdateien zu einem rezept gibt.
 */
export class MultipleFiles extends RezeptFileServiceError {
    constructor(readonly filename: string) {
        super();
    }
}

/**
 * Union-Type für Fehler beim Lesen eines Rezeptes.
 */
export type DownloadError = RezeptNotExists | FileNotFound | MultipleFiles;

/* eslint-enable max-classes-per-file */
