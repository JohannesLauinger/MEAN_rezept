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
 * Das Modul besteht aus dem Interface {@linkcode RezeptData} und der Klasse
 * {@linkcode RezeptDocument} für Mongoose. Aus dem Interface {@linkcode RezeptData}
 * ist das Interface {@linkcode rezept} extrahiert, das an der REST- und
 * GraphQL-Schnittstelle verwendet wird.
 * @packageDocumentation
 */

/**
 * Alias-Typ für gültige Strings bei Kochen.
 */
export type Koch = 'STEFFEN_HENSSLER' | 'JOHANN_LAFER';

/**
 * Alias-Typ für gültige Strings bei der Art eines Rezeptes.
 */
export type RezeptArt = 'SNACK' | 'HAUPTMAHLZEIT';

/**
 * Gemeinsames Interface für _REST_, _GraphQL_ und _Mongoose_.
 */
export interface rezept {
    // _id und __v werden bei REST durch HATEOAS und ETag abgedeckt
    // und deshalb beim Response entfernt.
    // Ausserdem wird _id bei einem POST-Request generiert
    _id?: string; // eslint-disable-line @typescript-eslint/naming-convention

    __v?: number; // eslint-disable-line @typescript-eslint/naming-convention

    readonly name: string | null | undefined;
    readonly schwierigkeit: number | null | undefined;
    readonly art: RezeptArt | '' | null | undefined;
    readonly koch: Koch | '' | null | undefined;
    readonly preis: number | undefined;
    readonly schaerfe: number | undefined;
    readonly verfuegbar: boolean | undefined;

    // string bei REST und Date bei GraphQL sowie Mongoose
    datum: Date | string | undefined;

    readonly hinweis: string | null | undefined;
    readonly homepage: string | null | undefined;
    readonly zutaten?: string[];
    readonly gewuerze: unknown;
}

/**
 * Interface für die Rohdaten aus MongoDB durch die _Mongoose_-Funktion `lean()`.
 */
export interface RezeptData extends rezept {
    // Zeitstempel fuer die MongoDB-Dokumente:
    // wird bei der Rueckgabe aus dem Anwendungskern entfernt
    createdAt?: Date;

    updatedAt?: Date;
}
