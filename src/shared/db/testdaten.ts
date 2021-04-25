/*
 * Copyright (C) 2020 - present Juergen Zimmermann, Hochschule Karlsruhe
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
 * Das Modul enthält Funktionen für den DB-Zugriff einschließlich GridFS und
 * Neuladen der Test-DB.
 * @packageDocumentation
 */

import type { RezeptData } from '../../rezept/entity';

/* eslint-disable @typescript-eslint/naming-convention */

/**
 * Die Testdaten, um die Test-DB neu zu laden, als JSON-Array.
 */
export const testdaten: RezeptData[] = [
    {
        _id: '00000000-0000-0000-0000-000000000001',
        name: 'Alpha',
        schwierigkeit: 4,
        art: 'SNACK',
        koch: 'JOHANN_LAFER',
        preis: 11.1,
        schaerfe: 0.011,
        verfuegbar: true,
        // https://docs.mongodb.com/manual/reference/method/Date
        datum: new Date('2020-02-01'),
        hinweis: '978-3897225831',
        homepage: 'https://acme.at/',
        zutaten: ['JAVASCRIPT'],
        gewuerze: [
            {
                nachname: 'Alpha',
                vorname: 'Adriana',
            },
            {
                nachname: 'Alpha',
                vorname: 'Alfred',
            },
        ],
        __v: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        _id: '00000000-0000-0000-0000-000000000002',
        name: 'Beta',
        schwierigkeit: 2,
        art: 'HAUPTMAHLZEIT',
        koch: 'STEFFEN_HENSSLER',
        preis: 22.2,
        schaerfe: 0.022,
        verfuegbar: true,
        datum: new Date('2020-02-02'),
        hinweis: '978-3827315526',
        homepage: 'https://acme.biz/',
        zutaten: ['TYPESCRIPT'],
        gewuerze: [
            {
                nachname: 'Beta',
                vorname: 'Brunhilde',
            },
        ],
        __v: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        _id: '00000000-0000-0000-0000-000000000003',
        name: 'Gamma',
        schwierigkeit: 1,
        art: 'SNACK',
        koch: 'JOHANN_LAFER',
        preis: 33.3,
        schaerfe: 0.033,
        verfuegbar: true,
        datum: new Date('2020-02-03'),
        hinweis: '978-0201633610',
        homepage: 'https://acme.com/',
        zutaten: ['JAVASCRIPT', 'TYPESCRIPT'],
        gewuerze: [
            {
                nachname: 'Gamma',
                vorname: 'Claus',
            },
        ],
        __v: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        _id: '00000000-0000-0000-0000-000000000004',
        name: 'Delta',
        schwierigkeit: 3,
        art: 'SNACK',
        koch: 'STEFFEN_HENSSLER',
        preis: 44.4,
        schaerfe: 0.044,
        verfuegbar: true,
        datum: new Date('2020-02-04'),
        hinweis: '978-0387534046',
        homepage: 'https://acme.de/',
        zutaten: [],
        gewuerze: [
            {
                nachname: 'Delta',
                vorname: 'Dieter',
            },
        ],
        __v: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        _id: '00000000-0000-0000-0000-000000000005',
        name: 'Epsilon',
        schwierigkeit: 2,
        art: 'HAUPTMAHLZEIT',
        koch: 'JOHANN_LAFER',
        preis: 55.5,
        schaerfe: 0.055,
        verfuegbar: true,
        datum: new Date('2020-02-05'),
        hinweis: '978-3824404810',
        homepage: 'https://acme.es/',
        zutaten: ['TYPESCRIPT'],
        gewuerze: [
            {
                nachname: 'Epsilon',
                vorname: 'Elfriede',
            },
        ],
        __v: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];
Object.freeze(testdaten);

/* eslint-enable @typescript-eslint/naming-convention */
