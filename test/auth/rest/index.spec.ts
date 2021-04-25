/* eslint-disable max-lines,max-lines-per-function,no-underscore-dangle */

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
import { HttpStatus, nodeConfig } from '../../../src/shared';
import { afterAll, beforeAll, describe, test } from '@jest/globals';
import fetch, { Headers, Request } from 'node-fetch';
import type { AddressInfo } from 'net';
import { PATHS } from '../../../src/app';
import each from 'jest-each';
import type { Server } from 'http';
import chai from 'chai';
import dotenv from 'dotenv';

dotenv.config();
const { env } = process;
const { USER_PASSWORD, USER_PASSWORD_FALSCH } = env; // eslint-disable-line @typescript-eslint/naming-convention

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
const username = 'admin';
const password = USER_PASSWORD;
const passwordFalsch = [USER_PASSWORD_FALSCH, USER_PASSWORD_FALSCH];

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------
let server: Server;
let loginUri: string;

// Test-Suite
describe('REST-Schnittstelle /api/login', () => {
    // Testserver starten und dabei mit der DB verbinden
    beforeAll(async () => {
        server = await createTestserver();

        const address = server.address() as AddressInfo;
        const baseUri = `https://${nodeConfig.host}:${address.port}`;
        loginUri = `${baseUri}${PATHS.login}`;
    });

    afterAll(() => { server.close() });

    test('Login mit korrektem Passwort', async () => {
        // given
        const headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded',
        });
        const body = `username=${username}&password=${password}`;
        const request = new Request(loginUri, {
            method: HttpMethod.POST,
            headers,
            body,
            agent,
        });

        // when
        const response = await fetch(request);

        // then
        expect(response.status).to.be.equal(HttpStatus.OK);
        const responseBody = await response.json();
        const tokenStr: string = responseBody.token;
        const tokenParts = tokenStr.split('.');
        expect(tokenParts.length).to.be.equal(3);
    });

    each(passwordFalsch).test('Login mit falschem Passwort', async (pwd) => {
        // given
        const headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded',
        });
        const body = `username=${username}&password=${pwd}`;
        const request = new Request(loginUri, {
            method: HttpMethod.POST,
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

    test('Login ohne Benutzerkennung', async () => {
        // given
        const headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded',
        });
        const request = new Request(loginUri, {
            method: HttpMethod.POST,
            headers,
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
