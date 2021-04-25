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

import { HttpMethod, agent } from './testserver';
import fetch, { Headers, Request } from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();
const { env } = process;
const { USER_PASSWORD } = env; // eslint-disable-line @typescript-eslint/naming-convention

const username = 'admin';
const password = USER_PASSWORD as string;

export const login = async (
    loginUri: string,
    credentials = { username, password },
) => {
    let headers = new Headers({
        'Content-type': 'application/x-www-form-urlencoded',
    });
    let body = `username=${credentials.username}&password=${credentials.password}`;
    let request = new Request(loginUri, {
        method: HttpMethod.POST,
        headers,
        body,
        agent,
    });
    let response = await fetch(request);
    const { token } = await response.json();
    return token;
};
