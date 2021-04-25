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
 * Das Modul enthält Objekte mit Daten aus Umgebungsvariablen.
 * @packageDocumentation
 */

// Umgebungsvariable durch die Konfigurationsdatei .env
import dotenv from 'dotenv';

interface NodeConfigEnv {
    serverPort: string | undefined;
    // fuer OpenShift
    port: string | undefined;
}

interface DbConfigEnv {
    name: string | undefined;
    host: string | undefined;
    user: string | undefined;
    password: string | undefined;
    populate: string | undefined;
    populateFiles: string | undefined;
}

interface MailConfigEnv {
    host: string | undefined;
    port: string | undefined;
    log: string | undefined;
}

interface LogConfigEnv {
    logDir: string | undefined;
    logLevelConsole: string | undefined;
    colorConsole: string | undefined;
}

// .env nur einlesen, falls nicht in Kubernetes bzw. in der Cloud
dotenv.config();

const { env } = process;

/**
 * Umgebungsvariable `NODE_ENV` als gleichnamige Konstante, die i.a. einen der
 * folgenden Werte enthält:
 * - `production`, z.B. in der _Heroku_-Cloud,
 * - `development` oder
 * - `test`
 */
export const NODE_ENV = env.NODE_ENV; // eslint-disable-line prefer-destructuring

const {
    SERVER_PORT,
    PORT,
    DB_NAME,
    DB_HOST,
    DB_USER,
    DB_PASS,
    DB_POPULATE,
    DB_POPULATE_FILES,
    MAIL_HOST,
    MAIL_PORT,
    MAIL_LOG,
    LOG_DIR,
    LOG_LEVEL_CONSOLE,
    LOG_COLOR_CONSOLE,
} = env;

/**
 * Eingelesene Umgebungsvariable für den _Node_-basierten Appserver:
 * - SERVER_PORT wenn der Server lokal (_On Premise_) oder in _Kubernetes_ läuft
 * - PORT (wird implizit bei _Heroku_ gesetzt)
 */
export const nodeConfigEnv: NodeConfigEnv = {
    serverPort: SERVER_PORT,
    port: PORT,
};
Object.freeze(nodeConfigEnv);

/**
 * Eingelesene Umgebungsvariable für den DB-Zugriff:
 * - DB_NAME
 * - DB_HOST
 * - DB_USER
 * - DB_PASS
 * - DB_POPULATE
 * - DB_POPULATE_FILES
 */
export const dbConfigEnv: DbConfigEnv = {
    name: DB_NAME,
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    populate: DB_POPULATE,
    populateFiles: DB_POPULATE_FILES,
};
Object.freeze(dbConfigEnv);

/**
 * Eingelesene Umgebungsvariable für den Mail-Client:
 * - MAIL_HOST
 * - MAIL_PORT
 * - MAIL_LOG
 */
export const mailConfigEnv: MailConfigEnv = {
    host: MAIL_HOST,
    port: MAIL_PORT,
    log: MAIL_LOG,
};
Object.freeze(mailConfigEnv);

/**
 * Eingelesene Umgebungsvariable für das Logging:
 * - LOG_DIR
 * - LOG_LEVEL_CONSOLE
 * - LOG_COLOR_CONSOLE
 */
export const logConfigEnv: LogConfigEnv = {
    logDir: LOG_DIR,
    logLevelConsole: LOG_LEVEL_CONSOLE,
    colorConsole: LOG_COLOR_CONSOLE,
};
Object.freeze(logConfigEnv);
