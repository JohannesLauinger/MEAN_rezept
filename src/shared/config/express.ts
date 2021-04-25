/*
 * Copyright (C) 2021 - present Juergen Zimmermann, Hochschule Karlsruhe
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
 * Das Modul enthält Informationen zur _Express_-App.
 * @packageDocumentation
 */

import { NODE_ENV } from './env';
import type { Options } from 'express-rate-limit';

/**
 * Soll die _Express_-App im Entwicklermodus laufen und deshalb mehr
 * Protokoll-Ausgaben produzieren?
 */
export const devMode =
    NODE_ENV !== undefined &&
    (NODE_ENV.startsWith('dev') || NODE_ENV.startsWith('test'));

/**
 * Konfiguration für _express-rate-limit_:
 * - Dauer eines Zeitfensters
 * - maximale Anzahl Requests je IP-Adresse innerhalb eines solchen Zeitfensters
 */
export const rateLimitOptions: Options = {
    /**
     * 15 Minuten als Zeitfenster (in Millisekunden).
     */
    windowMs: 15 * 60 * 1000, // eslint-disable-line @typescript-eslint/no-magic-numbers

    /**
     * max 100 requests/IP in einem Zeitfenster
     */
    max: 100,
};
