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
 * Das Modul enthält das Logger-Objekt von _Winston_.
 * @packageDocumentation
 */

import { cloud, consoleOptions, fileOptions } from './config';
import { createLogger, transports } from 'winston';
import type TransportStream from 'winston-transport';

// Winston: seit 2010 bei GoDaddy (Registrierung von Domains)
// Log-Levels: error, warn, info, debug, verbose, silly, ...
// Medien (= Transports): Console, File, ...
// https://github.com/winstonjs/winston/blob/master/docs/transports.md
// Alternativen: log4js (mit .d.ts), Pino, Bunyan

const { Console, File } = transports; // eslint-disable-line @typescript-eslint/naming-convention

const consoleInstance = new Console(consoleOptions);
const transportStream: TransportStream | TransportStream[] =
    cloud === undefined
        ? [consoleInstance, new File(fileOptions)]
        : consoleInstance;

/**
 * Das Logger-Objekt von Winston, um in der Konsole und/oder in eine Datei
 * zu protokollieren.
 */
export const logger = createLogger({ transports: transportStream });
Object.freeze(logger);

logger.debug('consoleOptions: %o', consoleOptions);
if (cloud === undefined) {
    logger.debug('fileOptions: %o', fileOptions);
}
logger.info('Logging durch Winston ist konfiguriert');
