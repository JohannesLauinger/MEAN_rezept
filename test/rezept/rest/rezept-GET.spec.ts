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

import { HttpStatus, nodeConfig } from '../../../src/shared';
import { agent, createTestserver } from '../../testserver';
import { afterAll, beforeAll, describe, test } from '@jest/globals';
import type { AddressInfo } from 'net';
import type { rezept } from '../../../src/rezept/entity';
import { PATHS } from '../../../src/app';
import type { Server } from 'http';
import chai from 'chai';
import each from 'jest-each';
import fetch from 'node-fetch';

const { expect } = chai;

// IIFE (= Immediately Invoked Function Expression) statt top-level await
// https://developer.mozilla.org/en-US/docs/Glossary/IIFE
(async () => {
    // startWith(), endWith()
    const chaiString = await import('chai-string');
    chai.use(chaiString.default);
})();

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------
const nameVorhanden = ['a', 't', 'g'];
const nameNichtVorhanden = ['xx', 'yy'];
const zutatenVorhanden = ['javascript', 'typescript'];
const zutatenNichtVorhanden = ['csharp', 'php'];

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------
let server: Server;
const path = PATHS.rezepte;
let rezepteUri: string;

// Test-Suite
describe('GET /api/rezepte', () => {
    beforeAll(async () => {
        server = await createTestserver();

        const address = server.address() as AddressInfo;
        rezepteUri = `https://${nodeConfig.host}:${address.port}${path}`;
    });

    afterAll(() => { server.close() });

    test('Alle Rezepte', async () => {
        // given

        // when
        const response = await fetch(rezepteUri, { agent });

        // then
        const { status, headers } = response;
        expect(status).to.be.equal(HttpStatus.OK);
        expect(headers.get('Content-Type')).to.match(/json/iu);
        // https://jestjs.io/docs/en/expect
        // JSON-Array mit mind. 1 JSON-Objekt
        const rezepte: Array<any> = await response.json();
        expect(rezepte).not.to.be.empty;
        rezepte.forEach((rezept) => {
            const selfLink = rezept._links.self.href;
            expect(selfLink).to.have.string(path);
        });
    });

    each(nameVorhanden).test(
        'Rezepte mit einem Name, der "%s" enthaelt',
        async (teilName) => {
            // given
            const uri = `${rezepteUri}?name=${teilName}`;

            // when
            const response = await fetch(uri, { agent });

            // then
            const { status, headers } = response;
            expect(status).to.be.equal(HttpStatus.OK);
            expect(headers.get('Content-Type')).to.match(/json/iu);
            // JSON-Array mit mind. 1 JSON-Objekt
            const body = await response.json();
            expect(body).not.to.be.empty;

            // Jedes rezept hat einen Name mit dem Teilstring 'a'
            body.map((rezept: rezept) => rezept.name).forEach((name: string) =>
                expect(name.toLowerCase()).to.have.string(teilName),
            );
        },
    );

    each(nameNichtVorhanden).test(
        'Keine Rezepte mit einem Name, der "%s" nicht enthaelt',
        async (teilName) => {
            // given
            const uri = `${rezepteUri}?name=${teilName}`;

            // when
            const response = await fetch(uri, { agent });

            // then
            expect(response.status).to.be.equal(HttpStatus.NOT_FOUND);
            const body = await response.text();
            expect(body).to.be.equalIgnoreCase('not found');
        },
    );

    each(zutatenVorhanden).test(
        'Mind. 1 rezept mit dem Schlagwort "%s"',
        async (schlagwort) => {
            // given
            const uri = `${rezepteUri}?${schlagwort}=true`;

            // when
            const response = await fetch(uri, { agent });

            // then
            const { status, headers } = response;
            expect(status).to.be.equal(HttpStatus.OK);
            expect(headers.get('Content-Type')).to.match(/json/iu);
            // JSON-Array mit mind. 1 JSON-Objekt
            const body = await response.json();
            expect(body).not.to.be.empty;

            // Jedes rezept hat im Array der Zutaten "javascript"
            body.map(
                (rezept: rezept) => rezept.zutaten,
            ).forEach((s: Array<string>) =>
                expect(s).to.include(schlagwort.toUpperCase()),
            );
        },
    );

    each(zutatenNichtVorhanden).test(
        'Keine Rezepte mit dem Schlagwort "%s"',
        async (schlagwort) => {
            // given
            const uri = `${rezepteUri}?${schlagwort}=true`;

            // when
            const response = await fetch(uri, { agent });

            // then
            expect(response.status).to.be.equal(HttpStatus.NOT_FOUND);
            const body = await response.text();
            expect(body).to.be.equalIgnoreCase('not found');
        },
    );
});
