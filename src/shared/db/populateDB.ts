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
 * Das Modul enthält Funktionen, um die Test-DB neu zu laden.
 * @packageDocumentation
 */

import type { Db, MongoClient } from 'mongodb';
import { cloud, dbConfig } from './../config';
import { GridFSBucket } from 'mongodb';
import { connectMongoDB } from './mongoDB';
import { createReadStream } from 'fs';
import { logger } from '../logger';
import { resolve } from 'path';
import { save } from './gridfs';
import { testdaten } from './testdaten';

const createCollection = async (db: Db) => {
    // http://mongodb.github.io/node-mongodb-native/3.5/api/Db.html#dropCollection
    const collectionName = 'rezept';
    logger.warn('Die Collection "%s" wird geloescht...', collectionName);
    let dropped = false;
    try {
        dropped = await db.dropCollection(collectionName);
    } catch (err: any) {
        // Falls der Error *NICHT* durch eine fehlende Collection verursacht wurde
        if (err.name !== 'MongoError') {
            logger.error('Fehler beim Neuladen der DB %s', db.databaseName);
            return;
        }
    }
    if (dropped) {
        logger.warn('Die Collection "%s" wurde geloescht.', collectionName);
    }

    // http://mongodb.github.io/node-mongodb-native/3.5/api/Db.html#createCollection
    logger.warn('Die Collection "%s" wird neu angelegt...', collectionName);
    const collection = await db.createCollection(collectionName);
    logger.warn(
        'Die Collection "%s" wurde neu angelegt.',
        collection.collectionName,
    );

    // http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#insertMany
    const result = await collection.insertMany(testdaten);
    logger.warn('%d Datensaetze wurden eingefuegt.', result.insertedCount);

    return collection;
};

const uploadBinary = (db: Db, client: MongoClient) => {
    // Kein File-Upload in die Cloud und in Kubernetes
    if (cloud !== undefined) {
        logger.info('uploadBinary(): Keine Binaerdateien mit der Cloud');
        return;
    }

    const filenameBinary = 'image.png';
    const contentType = 'image/png';

    const filename = '00000000-0000-0000-0000-000000000001';
    logger.warn('uploadBinary(): "%s" wird eingelesen.', filename);

    // https://mongodb.github.io/node-mongodb-native/3.5/tutorials/gridfs/streaming
    const bucket = new GridFSBucket(db);
    bucket.drop();

    // bei "ESnext" statt "CommonJS": __dirname ist nicht vorhanden
    // import { dirname } from 'path';
    // import { fileURLToPath } from 'url';
    // const filename = fileURLToPath(import.meta.url);
    // const currentDir = dirname(filename);

    /* global __dirname */
    const readable = createReadStream(resolve(__dirname, filenameBinary));
    const metadata = { contentType };
    save(readable, bucket, filename, { metadata }, client);
    logger.warn('uploadBinary(): "%s" wurde eingelesen.', filename);
};

/**
 * Die Test-DB wird im Development-Modus neu geladen.
 */
export const populateDB = async () => {
    const { dbPopulate, dbPopulateFiles } = dbConfig;
    logger.info('populateDB(): %s', dbPopulate);

    if (!dbPopulate) {
        return;
    }

    const { db, client } = await connectMongoDB();

    const collection = await createCollection(db);
    if (collection === undefined) {
        return;
    }

    if (dbPopulateFiles) {
        uploadBinary(db, client);
    }
};
