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

// https://json-schema.org/implementations.html

/**
 * Das Modul besteht aus dem Typ {@linkcode ValidationErrorMsg} und der
 * Funktion {@linkcode validateRezept} sowie notwendigen Konstanten.
 * @packageDocumentation
 */

// https://github.com/ajv-validator/ajv/blob/master/docs/validation.md
import Ajv from 'ajv/dist/2019';
import type { rezept } from './rezept';
import addFormats from 'ajv-formats';
import ajvErrors from 'ajv-errors';
import { jsonSchema } from './jsonSchema';
import { logger } from '../../shared';

/**
 * Konstante für den maximalen Wert bei den Bewertungen
 */
export const MAX_RATING = 5;

const ajv = new Ajv({
    allowUnionTypes: true,
    allErrors: true,
});

// Formate für Ajv bereitstellen, wie z.B. date oder uri
addFormats(ajv);

// eigene Fehlermeldungen im JSON Schema statt der generischen Texte
ajvErrors(ajv);

/**
 * Typ für mögliche Fehlertexte bei der Validierung.
 */
export type ValidationErrorMsg = Record<string, string | undefined>;

/**
 * Funktion zur Validierung, wenn neue Bücher angelegt oder vorhandene Bücher
 * aktualisiert bzw. überschrieben werden sollen.
 */
export const validateRezept = (rezept: rezept) => {
    const validate = ajv.compile<rezept>(jsonSchema);
    validate(rezept);
    // as DefinedError[]
    const errors = validate.errors ?? [];
    logger.debug('validateRezept: errors=%o', errors);
    const errorMsg: ValidationErrorMsg = {};
    errors.forEach((err) => {
        const key = err.dataPath.slice(1);
        // errorMsg[key] = (err as any).errorMessage as string; // eslint-disable-line security/detect-object-injection
        // Keine Benutzereingabe ("User Input")
        // https://github.com/nodesecurity/eslint-plugin-security/blob/master/docs/the-dangers-of-square-bracket-notation.md
        errorMsg[key] = err.message; // eslint-disable-line security/detect-object-injection
    });

    logger.debug('validateRezept: errorMsg=%o', errorMsg);
    return Object.entries(errorMsg).length === 0 ? undefined : errorMsg;
};
