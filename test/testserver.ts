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

import { Agent, createServer } from 'https';
import { connectDB, logger, populateDB, nodeConfig } from '../src/shared';
import type { AddressInfo } from 'net';
import type { RequestListener } from 'http';
import type { SecureContextOptions } from 'tls';
import type { Server } from 'http';
import { app } from '../src/app';

// -----------------------------------------------------------------------------
// T e s t s e r v e r   m i t   H T T P S   u n d   R a n d o m   P o r t
// -----------------------------------------------------------------------------
let server: Server;

export const createTestserver = async () => {
    await populateDB();
    await connectDB();

    const { cert, key } = nodeConfig;
    // Shorthand Properties
    const options: SecureContextOptions = { key, cert, minVersion: 'TLSv1.3' };
    server = createServer(options, app as RequestListener)
        // random port
        .listen(() => {
            logger.info(`Node ${process.version}`);
            const address = server.address() as AddressInfo;
            if (address !== null && typeof address !== 'string') {
                const { host } = nodeConfig;
                logger.info(
                    `Testserver ist gestartet: https://${host}:${address.port}`,
                );
            }
            server.emit('testServerStarted');
        });
    return server;
};

// fuer selbst-signierte Zertifikate
export const agent = new Agent({ rejectUnauthorized: false });

export enum HttpMethod {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    PATCH = 'patch',
    DELETE = 'delete',
}
