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
        name: 'Pfannkuchen',
        schwierigkeit: 2,
        art: 'HAUPTMAHLZEIT',
        koch: 'JOHANN_LAFER',
        preis: 11.1,
        schaerfe: 0.01,
        verfuegbar: true,
        // https://docs.mongodb.com/manual/reference/method/Date
        datum: new Date('2020-02-01'),
        hinweis: 'Sehr lecker mit Spargel!',
        homepage: 'https://acme.at/',
        zutaten: ['Mehl', 'Ei', 'Wasser'],
        gewuerze: [
            {
                gewuerz1: 'Salz',
                gewuerz2: 'Pfeffer',
            },
        ],
        __v: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        _id: '00000000-0000-0000-0000-000000000002',
        name: 'Spaetzle',
        schwierigkeit: 3,
        art: 'HAUPTMAHLZEIT',
        koch: 'STEFFEN_HENSSLER',
        preis: 15.2,
        schaerfe: 0.2,
        verfuegbar: true,
        datum: new Date('2020-02-02'),
        hinweis: 'Am besten noch ein Braten dazu!',
        homepage: 'https://acme.biz/',
        zutaten: ['Mehl', 'Ei'],
        gewuerze: [
            {
                gewuerz1: 'Salz',
                gewuerz2: 'Pfeffer',
            },
        ],
        __v: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        _id: '00000000-0000-0000-0000-000000000003',
        name: 'Waffeln',
        schwierigkeit: 1,
        art: 'SNACK',
        koch: 'JOHANN_LAFER',
        preis: 10.3,
        schaerfe: 0.0,
        verfuegbar: true,
        datum: new Date('2020-02-03'),
        hinweis: 'Viel Obst und Nutella dazu!',
        homepage: 'https://acme.com/',
        zutaten: ['Mehl', 'Butter', 'Backpulver'],
        gewuerze: [
            {
                gewuerz1: 'Salz',
                gewuerz2: 'Zucker',
            },
        ],
        __v: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        _id: '00000000-0000-0000-0000-000000000004',
        name: 'Obstsalat',
        schwierigkeit: 1,
        art: 'SNACK',
        koch: 'STEFFEN_HENSSLER',
        preis: 20.4,
        schaerfe: 0.0,
        verfuegbar: true,
        datum: new Date('2020-02-04'),
        hinweis: 'Wunderbar an heissen Sommertagen',
        homepage: 'https://acme.de/',
        zutaten: [],
        gewuerze: [
            {
                gewuerz1: 'Zucker',
            },
        ],
        __v: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        _id: '00000000-0000-0000-0000-000000000005',
        name: 'Pizza',
        schwierigkeit: 4,
        art: 'HAUPTMAHLZEIT',
        koch: 'JOHANN_LAFER',
        preis: 21.5,
        schaerfe: 0.3,
        verfuegbar: true,
        datum: new Date('2020-02-05'),
        hinweis: 'Empfohlen wird ein Pizzastein!',
        homepage: 'https://acme.es/',
        zutaten: ['Mehl', 'Hefe', 'Wasser'],
        gewuerze: [
            {
                gewuerz1: 'Salz',
                gewuerz2: 'Pizzagewuerz',
            },
        ],
        __v: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];
Object.freeze(testdaten);

/* eslint-enable @typescript-eslint/naming-convention */
