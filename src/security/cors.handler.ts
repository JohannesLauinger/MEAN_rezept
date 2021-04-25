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
 * Das Modul besteht aus der Funktion {@linkcode corsHandler} für die
 * Handhabung von CORS.
 * @packageDocumentation
 */

// Einlesen von application/json im Request-Rumpf
// Fuer multimediale Daten (Videos, Bilder, Audios): raw-body
import cors from 'cors';

/**
 * Funktion für die Handhabung von CORS.
 */
export const corsHandler =
    // CORS = Cross Origin Resource Sharing
    //   http://www.html5rocks.com/en/tutorials/cors
    //   https://www.w3.org/TR/cors
    cors({
        origin: 'https://localhost:4200',
        // nachfolgende Optionen nur fuer OPTIONS:
        methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: [
            'Origin',
            'Content-Type',
            'Accept',
            'Authorization',
            // 'Access-Control-Allow-Origin',
            // 'Access-Control-Allow-Methods',
            // 'Access-Control-Allow-Headers',
            'Allow',
            'Content-Length',
            'Date',
            'Last-Modified',
            'If-Match',
            'If-Not-Match',
            'If-Modified-Since',
        ],
        exposedHeaders: ['Location', 'ETag'],
        maxAge: 86_400,
    });
