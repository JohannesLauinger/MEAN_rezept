/*
 * Copyright (C) 2019 - present Juergen Zimmermann, Hochschule Karlsruhe
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
 * Das Modul enthält den Enum-Typ {@linkcode HttpStatus} für die gängigen
 * HTTP-Statuscodes.
 * @packageDocumentation
 */

/* eslint-disable @typescript-eslint/no-magic-numbers */

/**
 * Enum mit den gängigen Statuscodes beim HTTP-Protokoll
 */
export enum HttpStatus {
    OK = 200,
    CREATED = 201,
    NO_CONTENT = 204,
    NOT_MODIFIED = 304,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    NOT_ACCEPTABLE = 406,
    PRECONDITION_FAILED = 412,
    PRECONDITION_REQUIRED = 428,
    INTERNAL_ERROR = 500,
    NOT_YET_IMPLEMENTED = 501,
}

/* eslint-enable @typescript-eslint/no-magic-numbers */
