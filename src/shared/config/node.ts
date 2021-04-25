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
 * Das Modul enthält die Konfiguration für den _Node_-basierten Server.
 * @packageDocumentation
 */

import { Cloud, cloud } from './cloud';
import { hostname } from 'os';
import ip from 'ip';
import { nodeConfigEnv } from './env';
import { readFileSync } from 'fs';
import { resolve } from 'path';

interface NodeConfig {
    host: string;
    port: number;
    ip: string;
    key?: Buffer;
    cert?: Buffer;
}

const computername = hostname();
const ipAddress = ip.address();

let port = Number.NaN;
const portStr = nodeConfigEnv.serverPort;
if (portStr !== undefined) {
    port = Number.parseInt(portStr, 10);
}
if (Number.isNaN(port)) {
    // SERVER_PORT ist zwar gesetzt, aber keine Zahl
    // https://devcenter.heroku.com/articles/runtime-principles#web-servers
    if (cloud === undefined || cloud === Cloud.OPENSHIFT) {
        port = 3000; // eslint-disable-line @typescript-eslint/no-magic-numbers
    } else {
        // Heroku
        if (nodeConfigEnv.port === undefined) {
            process.exit(0); // eslint-disable-line no-process-exit,node/no-process-exit
        }
        port = Number.parseInt(nodeConfigEnv.port, 10);
    }
}

/**
 * Die Konfiguration für den _Node_-basierten Server:
 * - Rechnername
 * - IP-Adresse
 * - Port
 * - `PEM`- und Zertifikat-Datei mit dem öffentlichen und privaten Schlüssel
 *   für TLS
 */
export const nodeConfig: NodeConfig = {
    host: computername,
    ip: ipAddress,
    port,

    // https://nodejs.org/api/fs.html
    // https://nodejs.org/api/path.html
    // http://2ality.com/2017/11/import-meta.html
    /* global __dirname */
    key:
        cloud === undefined
            ? readFileSync(resolve(__dirname, 'key.pem'))
            : undefined,
    cert:
        cloud === undefined
            ? readFileSync(resolve(__dirname, 'certificate.cer'))
            : undefined,
};
Object.freeze(nodeConfig);

const logNodeConfig = {
    host: computername,
    port,
    ip: ipAddress,
};
console.info('nodeConfig: %o', logNodeConfig);
