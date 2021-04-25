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
 * Das Modul enthält die Konfiguration für den Umgang mit MIME-Typen.
 * @packageDocumentation
 */

/**
 * Konstante für 'content-type' und 'application/json' jeweils in Kleinrezeptstaben.
 */
export const mimeConfig = {
    contentType: 'content-type',
    json: 'application/json',
};

/**
 * Zu einem MIME-Typen wird die passende Datei-Endung geliefert.
 *
 * @param mimeType Der MIME-Typ als String.
 * @returns Die Datei-Endung, die zum gegebenen MIME-Typen passt.
 */
export const getExtension = (mimeType: string): string => {
    switch (mimeType) {
        case 'image/png':
            return 'png';
        case 'image/jpeg':
            return 'jpeg';
        case 'image/gif':
            return 'gif';
        case 'image/bmp':
            return 'bmp';
        case 'video/mp4':
            return 'mp4';
        default:
            return '';
    }
};
