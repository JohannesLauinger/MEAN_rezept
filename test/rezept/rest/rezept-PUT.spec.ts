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

import { HttpMethod, agent, createTestserver } from '../../testserver';
import { HttpStatus, logger, nodeConfig } from '../../../src/shared';
import { afterAll, beforeAll, describe, test } from '@jest/globals';
import fetch, { Headers, Request } from 'node-fetch';
import type { AddressInfo } from 'net';
import type { rezept } from '../../../src/rezept/entity';
import { MAX_RATING } from '../../../src/rezept/entity';
import { PATHS } from '../../../src/app';
import type { Server } from 'http';
import chai from 'chai';
import { login } from '../../login';

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
const geaendertesRezept: Omit<rezept, 'hinweis'> = {
    // hinweis wird nicht geaendet
    name: 'Geaendert',
    schwierigkeit: 1,
    art: 'SNACK',
    koch: 'JOHANN_LAFER',
    preis: 33.33,
    schaerfe: 0.033,
    verfuegbar: true,
    datum: '2016-02-03',
    homepage: 'https://test.te',
    gewuerze: [{ nachname: 'Gamma', vorname: 'Claus' }],
    zutaten: ['JAVASCRIPT', 'TYPESCRIPT'],
};
const idVorhanden = '00000000-0000-0000-0000-000000000003';

const geaendertesRezeptIdNichtVorhanden: Omit<rezept, 'hinweis' | 'homepage'> = {
    name: 'Nichtvorhanden',
    schwierigkeit: 1,
    art: 'SNACK',
    koch: 'JOHANN_LAFER',
    preis: 33.33,
    schaerfe: 0.033,
    verfuegbar: true,
    datum: '2016-02-03',
    gewuerze: [{ nachname: 'Gamma', vorname: 'Claus' }],
    zutaten: ['JAVASCRIPT', 'TYPESCRIPT'],
};
const idNichtVorhanden = '00000000-0000-0000-0000-000000000999';

const geaendertesRezeptInvalid: object = {
    name: 'Alpha',
    schwierigkeit: -1,
    art: 'UNSICHTBAR',
    koch: 'NO_VERLAG',
    preis: 0.01,
    schaerfe: 0,
    verfuegbar: true,
    datum: '12345-123-123',
    hinweis: 'falsche-ISBN',
    gewuerze: [{ nachname: 'Test', vorname: 'Theo' }],
    zutaten: [],
};

const veraltesRezept: object = {
    // hinweis wird nicht geaendet
    name: 'Veraltet',
    schwierigkeit: 1,
    art: 'SNACK',
    koch: 'JOHANN_LAFER',
    preis: 33.33,
    schaerfe: 0.033,
    verfuegbar: true,
    datum: '2016-02-03',
    homepage: 'https://test.te',
    gewuerze: [{ nachname: 'Gamma', vorname: 'Claus' }],
    zutaten: ['JAVASCRIPT', 'TYPESCRIPT'],
};

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------
const path = PATHS.rezepte;
let server: Server;
let rezepteUri: string;
let loginUri: string;

// Test-Suite
describe('PUT /api/rezepte/:id', () => {
    // Testserver starten und dabei mit der DB verbinden
    beforeAll(async () => {
        server = await createTestserver();

        const address = server.address() as AddressInfo;
        const baseUri = `https://${nodeConfig.host}:${address.port}`;
        rezepteUri = `${baseUri}${path}`;
        logger.info(`rezepteUri = ${rezepteUri}`);
        loginUri = `${baseUri}${PATHS.login}`;
    });

    afterAll(() => { server.close() });

    test('Vorhandenes rezept aendern', async () => {
        // given
        const token = await login(loginUri);
        const headers = new Headers({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'If-Match': '"0"',
        });
        const body = JSON.stringify(geaendertesRezept);
        const request = new Request(`${rezepteUri}/${idVorhanden}`, {
            method: HttpMethod.PUT,
            headers,
            body,
            agent,
        });

        // when
        const response = await fetch(request);

        // then
        expect(response.status).to.be.equal(HttpStatus.NO_CONTENT);
        const responseBody = await response.text();
        expect(responseBody).to.be.empty;
    });

    test('Nicht-vorhandenes rezept aendern', async () => {
        // given
        const token = await login(loginUri);
        const headers = new Headers({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'If-Match': '"0"',
        });
        const body = JSON.stringify(geaendertesRezeptIdNichtVorhanden);
        const request = new Request(`${rezepteUri}/${idNichtVorhanden}`, {
            method: HttpMethod.PUT,
            headers,
            body,
            agent,
        });

        // when
        const response = await fetch(request);

        // then
        expect(response.status).to.be.equal(HttpStatus.PRECONDITION_FAILED);
        const responseBody = await response.text();
        expect(responseBody).to.be.equal(
            `Es gibt kein rezept mit der ID "${idNichtVorhanden}".`,
        );
    });

    test('Vorhandenes rezept aendern, aber mit ungueltigen Daten', async () => {
        // given
        const token = await login(loginUri);
        const headers = new Headers({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'If-Match': '"0"',
        });
        const body = JSON.stringify(geaendertesRezeptInvalid);
        const request = new Request(`${rezepteUri}/${idVorhanden}`, {
            method: HttpMethod.PUT,
            headers,
            body,
            agent,
        });

        // when
        const response = await fetch(request);

        // then
        expect(response.status).to.be.equal(HttpStatus.BAD_REQUEST);
        const { art, schwierigkeit, koch, datum, hinweis } = await response.json();
        expect(art).to.be.equal(
            'Die Art eines Rezeptes muss HAUPTMAHLZEIT oder SNACK sein.',
        );
        expect(schwierigkeit).to.be.equal(`Eine Bewertung muss zwischen 0 und ${MAX_RATING} liegen.`);
        expect(koch).to.be.equal(
            'Der Koch eines Rezeptes muss JOHANN_LAFER oder STEFFEN_HENSSLER sein.',
        );
        expect(datum).to.be.equal('Das Datum muss im Format yyyy-MM-dd sein.');
        expect(hinweis).to.be.equal('Die ISBN-Nummer ist nicht korrekt.');
    });

    test('Vorhandenes rezept aendern, aber ohne Versionsnummer', async () => {
        // given
        const token = await login(loginUri);
        const headers = new Headers({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        });
        const body = JSON.stringify(geaendertesRezept);
        const request = new Request(`${rezepteUri}/${idVorhanden}`, {
            method: HttpMethod.PUT,
            headers,
            body,
            agent,
        });

        // when
        const response = await fetch(request);

        // then
        expect(response.status).to.be.equal(HttpStatus.PRECONDITION_REQUIRED);
        const responseBody = await response.text();
        expect(responseBody).to.be.equal('Versionsnummer fehlt');
    });

    test('Vorhandenes rezept aendern, aber mit alter Versionsnummer', async () => {
        // given
        const token = await login(loginUri);
        const headers = new Headers({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'If-Match': '"-1"',
        });
        const body = JSON.stringify(veraltesRezept);
        const request = new Request(`${rezepteUri}/${idVorhanden}`, {
            method: HttpMethod.PUT,
            headers,
            body,
            agent,
        });

        // when
        const response = await fetch(request);

        // then
        expect(response.status).to.be.equal(HttpStatus.PRECONDITION_FAILED);
        const responseBody = await response.text();
        expect(responseBody).to.have.string('Die Versionsnummer');
    });

    test('Vorhandenes rezept aendern, aber ohne Token', async () => {
        // given
        const headers = new Headers({
            'Content-Type': 'application/json',
            'If-Match': '"0"',
        });
        const body = JSON.stringify(geaendertesRezept);
        const request = new Request(`${rezepteUri}/${idVorhanden}`, {
            method: HttpMethod.PUT,
            headers,
            body,
            agent,
        });

        // when
        const response = await fetch(request);

        // then
        expect(response.status).to.be.equal(HttpStatus.UNAUTHORIZED);
        const responseBody = await response.text();
        expect(responseBody).to.be.equalIgnoreCase('unauthorized');
    });

    test('Vorhandenes rezept aendern, aber mit falschem Token', async () => {
        // given
        const token = 'FALSCH';
        const headers = new Headers({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'If-Match': '"0"',
        });
        const body = JSON.stringify(geaendertesRezept);
        const request = new Request(`${rezepteUri}/${idVorhanden}`, {
            method: HttpMethod.PUT,
            headers,
            body,
            agent,
        });

        // when
        const response = await fetch(request);

        // then
        expect(response.status).to.be.equal(HttpStatus.UNAUTHORIZED);
        const responseBody = await response.text();
        expect(responseBody).to.be.equalIgnoreCase('unauthorized');
    });
});
