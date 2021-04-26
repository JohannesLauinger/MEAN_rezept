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
 * Das Modul besteht aus der Klasse {@linkcode RezeptFileRequestHandler}, um die
 * Handler-Funktionen für die REST-Schnittstelle auf der Basis von Express
 * gebündelt bereitzustellen, damit Binärdateien hoch- und heruntergeladen
 * werden können.
 * @packageDocumentation
 */

import {
    RezeptFileService,
    RezeptFileServiceError,
    RezeptNotExists,
    FileNotFound,
    MultipleFiles,
} from '../service';
import { HttpStatus, logger } from '../../shared';
import type { Request, Response } from 'express';
import type { DownloadError } from '../service';

// export bei async und await:
// https://blogs.msdn.microsoft.com/typescript/2015/11/30/announcing-typescript-1-7
// http://tc39.github.io/ecmascript-export
// https://nemethgergely.com/async-function-best-practices#Using-async-functions-with-express

/**
 * Die Handler-Klasse fasst die Handler-Funktionen für Bücher zusammen, um die
 * REST-Schnittstelle auf Basis von Express für das Hoch- und Herunterladen
 * von Binärdateien zu realisieren.
 */
export class RezeptFileRequestHandler {
    private readonly service = new RezeptFileService();

    /**
     * Zu einem vorhandenen rezept wird eine Binärdatei mit z.B. einem Bild oder
     * einem Video hochgeladen.
     *
     * Im Request-Objekt von Express muss die ID des zu betreffenden Rezeptes
     * als Pfad-Parameter enthalten sein. Außerdem muss im Rumpf die Binärdatei
     * enthalten sein. Bei erfolgreicher Durchführung wird der Statuscode `204`
     * (`No Content`) gesetzt.
     *
     * @param req Request-Objekt von Express.
     * @param res Leeres Response-Objekt von Express.
     */
    upload(req: Request, res: Response) {
        const { id } = req.params;
        logger.debug('RezeptFileRequestHandler.upload(): id=%s', id);

        if (id === undefined) {
            res.sendStatus(HttpStatus.INTERNAL_ERROR);
            return;
        }

        // https://jsao.io/2019/06/uploading-and-downloading-files-buffering-in-node-js

        const data: Uint8Array[] = [];
        let totalBytesInBuffer = 0;

        // Wenn body-parser verwendet wird (z.B. bei textuellen JSON-Daten),
        // dann verarbeitet body-parser die Events "data" und "end".
        // https://nodejs.org/api/http.html#http_class_http_clientrequest

        req.on('data', (chunk: Uint8Array) => {
            const { length } = chunk;
            logger.debug('RezeptFileRequestHandler.upload(): data %d', length);
            data.push(chunk);
            totalBytesInBuffer += length;
        })
            .on('aborted', () =>
                logger.debug('RezeptFileRequestHandler.upload(): aborted'),
            )
            .on('end', () => {
                logger.debug(
                    'RezeptFileRequestHandler.upload(): end %d',
                    totalBytesInBuffer,
                );
                const buffer = Buffer.concat(data, totalBytesInBuffer);

                // IIFE (= Immediately Invoked Function Expression) wegen await
                // https://developer.mozilla.org/en-US/docs/Glossary/IIFE
                // https://github.com/typescript-eslint/typescript-eslint/issues/647
                // https://github.com/typescript-eslint/typescript-eslint/pull/1799
                (async () => {
                    try {
                        await this.save(req, id, buffer);
                    } catch (err: unknown) {
                        logger.error('Fehler beim Abspeichern: %o', err);
                        return;
                    }

                    res.sendStatus(HttpStatus.NO_CONTENT);
                })();
            });
    }

    /**
     * Zu einem vorhandenen rezept wird eine Binärdatei mit z.B. einem Bild oder
     * einem Video asynchron heruntergeladen. Im Request-Objekt von Express muss
     * die ID des zu betreffenden Rezeptes als Pfad-Parameter enthalten sein.
     *
     * Bei erfolgreicher Durchführung wird der Statuscode `200` (`OK`) gesetzt.
     * Falls es kein rezept mit der angegebenen ID gibt, wird der Statuscode `412`
     * (`Precondition Failed`) gesetzt. Wenn es das rezept zur angegebenen ID zwar
     * gibt, aber zu diesem rezept keine Binärdatei existiert, dann wird der
     * Statuscode `404` (`Not Found`) gesetzt.
     *
     * @param req Request-Objekt von Express.
     * @param res Leeres Response-Objekt von Express.
     * @returns Leeres Promise-Objekt.
     */
    async download(req: Request, res: Response) {
        const { id } = req.params;
        logger.debug('RezeptFileRequestHandler.downloadBinary(): %s', id);
        if (id === undefined) {
            res.sendStatus(HttpStatus.INTERNAL_ERROR);
            return;
        }

        const findResult = await this.service.find(id);
        if (
            findResult instanceof RezeptFileServiceError ||
            findResult instanceof RezeptNotExists
        ) {
            this.handleDownloadError(findResult, res);
            return;
        }

        const file = findResult;
        const { readStream, contentType } = file;
        res.contentType(contentType);
        // https://www.freecodecamp.org/news/node-js-streams-everything-you-need-to-know-c9141306be93
        readStream.pipe(res);
    }

    private async save(req: Request, id: string, buffer: Buffer) {
        const contentType = req.headers['content-type'];
        await this.service.save(id, buffer, contentType);
    }

    private handleDownloadError(
        err: RezeptNotExists | DownloadError,
        res: Response,
    ) {
        if (err instanceof RezeptNotExists) {
            const { id } = err;
            const msg = `Es gibt kein rezept mit der ID "${id}".`;
            logger.debug(
                'RezeptFileRequestHandler.handleDownloadError(): msg=%s',
                msg,
            );
            res.status(HttpStatus.PRECONDITION_FAILED)
                .set('Content-Type', 'text/plain')
                .send(msg);
            return;
        }

        if (err instanceof FileNotFound) {
            const { filename } = err;
            const msg = `Es gibt kein File mit Name ${filename}`;
            logger.debug(
                'RezeptFileRequestHandler.handleDownloadError(): msg=%s',
                msg,
            );
            res.status(HttpStatus.NOT_FOUND).send(msg);
            return;
        }

        if (err instanceof MultipleFiles) {
            const { filename } = err;
            const msg = `Es gibt mehr als ein File mit Name ${filename}`;
            logger.debug(
                'RezeptFileRequestHandler.handleDownloadError(): msg=%s',
                msg,
            );
            res.status(HttpStatus.INTERNAL_ERROR).send(msg);
        }
    }
}
