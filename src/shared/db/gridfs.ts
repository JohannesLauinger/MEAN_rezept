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
 * Das Modul enthält die Funktion {@linkcode save} für _GridFS_.
 * @packageDocumentation
 */

import type {
    GridFSBucket,
    GridFSBucketOpenUploadStreamOptions,
    GridFSBucketWriteStream,
    MongoClient,
} from 'mongodb';
import { closeMongoDBClient } from './mongoDB';
import { logger } from '../../shared/logger';

/**
 * Eine Funktion, um Binärdaten aus einem ReadableStream in GridFS abzuspeichern
 *
 * @param readableStream ReadableStream von Node
 * @param bucket Bucket für GridFS
 * @param filename Dateiname der abzuspeichernden Binärdatei
 * @param metadata Metadaten, z.B. MIME-Type, der abzuspeichernden Binärdatei
 * @param client MongoClient für die DB-Verbindung
 */
/* eslint-disable max-params */
export const save = (
    readableStream: NodeJS.ReadableStream,
    bucket: GridFSBucket,
    filename: string,
    metadata: GridFSBucketOpenUploadStreamOptions,
    client: MongoClient,
): GridFSBucketWriteStream =>
    readableStream
        .pipe(bucket.openUploadStream(filename, metadata))
        .on('finish', () => {
            logger.debug('gridfs.save(): UploadStream ist beendet');
            closeMongoDBClient(client);
        });
/* eslint-enable max-params */
