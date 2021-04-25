/*
 * Copyright (C) 2017 - present Juergen Zimmermann, Hochschule Karlsruhe
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
 * Das Modul enthält Funktionen, um eine Verbindung zu MongoDB aufzubauen und
 * zu schließen.
 * @packageDocumentation
 */

import { MongoClient } from 'mongodb';
import type { MongoClientOptions } from 'mongodb';
import { dbConfig } from '../config/db';
import { logger } from '../../shared/logger';

/**
 * Funktion, um eine Verbindung zu MongoDB aufzubauen
 */
export const connectMongoDB = async () => {
    const { dbName, url } = dbConfig;
    logger.debug('mongodb.connectMongoDB(): url=%s', url);
    const options: MongoClientOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    const client = new MongoClient(url, options);
    await client.connect();
    logger.debug('mongodb.connectMongoDB(): DB-Client geoeffnet');
    const db = client.db(dbName);

    return { db, client };
};

/**
 * Funktion, um eine Verbindung zu MongoDB zu schließen
 * @param client ein `MongoClient`-Objekt mit einer geöffneten DB-Verbindung
 */
export const closeMongoDBClient = (client: MongoClient): void => {
    // NICHT: async, weil die Funktion fuer Request-Events beim Hochladen und
    // fuer GridFS-Events beim Herunterladen verwendet wird

    // IIFE (= Immediately Invoked Function Expression) wegen await
    // https://developer.mozilla.org/en-US/docs/Glossary/IIFE
    // https://github.com/typescript-eslint/typescript-eslint/issues/647
    // https://github.com/typescript-eslint/typescript-eslint/pull/1799
    (async () => {
        try {
            await client.close();
        } catch (err: unknown) {
            logger.error('mongodb.closeDbClient(): %o', err);
            return;
        }

        logger.debug('mongodb.closeDbClient(): DB-Client wurde geschlossen');
    })();
};
