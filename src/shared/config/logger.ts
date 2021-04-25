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

import { Cloud, cloud } from './cloud';
import { NODE_ENV, logConfigEnv } from './env';
import JSON5 from 'json5';
import { format } from 'winston';
import { resolve } from 'path';

/**
 * Das Modul enthält die Konfiguration für den Logger mit _Winston_ sowie
 * die Request-Protokollierung mit _Morgan_.
 * @packageDocumentation
 */

// Winston: seit 2010 bei GoDaddy (Registrierung von Domains)
// Log-Levels: error, warn, info, debug, verbose, silly, ...
// Medien (= Transports): Console, File, ...
// https://github.com/winstonjs/winston/blob/master/docs/transports.md
// Alternative: Pino, log4js, Bunyan

const logLevelConsole = logConfigEnv.logLevelConsole ?? 'info';
const { logDir, colorConsole } = logConfigEnv;

/**
 * Sollen die Protokoll-Ausgaben in der Konsole farbig dargestellt werden?
 */
export const logColorConsole =
    colorConsole === undefined ||
    (colorConsole !== 'false' && colorConsole !== 'FALSE'); // eslint-disable-line @typescript-eslint/no-extra-parens

const { colorize, combine, json, simple, splat, timestamp } = format;

const loglevelConsoleDev = cloud === undefined ? logLevelConsole : 'debug';
const consoleFormat =
    cloud !== undefined || !logColorConsole
        ? combine(splat(), simple())
        : combine(splat(), colorize(), simple());
const production = NODE_ENV === 'production' || NODE_ENV === 'PRODUCTION';
/**
 * Optionen für die Protokoll-Ausgaben in der Konsole.
 */
export const consoleOptions = {
    level: production && cloud !== Cloud.HEROKU ? 'warn' : loglevelConsoleDev,
    format: consoleFormat,
};
Object.freeze(consoleOptions);
console.log(`Log-Optionen fuer Konsole: ${JSON5.stringify(consoleOptions)}`); // eslint-disable-line security-node/detect-crlf

/**
 * Optionen für die Protokoll-Ausgaben in der Protokolldatei.
 */
export const fileOptions = {
    filename: resolve(logDir ?? '/var/log/node', 'server.log'),
    level: production ? 'info' : 'debug',
    // in KB
    maxsize: 250_000,
    maxFiles: 3,
    format: combine(splat(), timestamp(), json()),
};
Object.freeze(fileOptions);
console.log(`Log-Optionen fuer Logdatei: ${JSON5.stringify(fileOptions)}`); // eslint-disable-line security-node/detect-crlf

/**
 * Formatierung, wenn mit _Morgan_ die Requests protokolliert werden.
 * `dev`, wenn in der Konsole die Winston-Ausgaben farbig dargestellt werden.
 * Sonst `short`.
 */
export const morganFormat = logColorConsole ? 'dev' : 'short';
Object.freeze(morganFormat);
