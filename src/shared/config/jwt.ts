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

import type { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Das Modul enthält die Konfiguration für JWT.
 * @packageDocumentation
 */

export const secret = 'p';

// HMAC = Keyed-Hash MAC (= Message Authentication Code)
// HS256 = HMAC mit SHA-256
// Passwort (bzw. Secret) erforderlich
// Bei SHA-3 ist HMAC nicht mehr notwendig.
// SHA-3 ist bei bei den Algorithmen fuer JWT *NICHT* aufgelistet:
// https://tools.ietf.org/html/rfc7518
// const algorithm = 'HS256';

// RSA von Ron Rivest, Adi Shamir, Leonard Adleman
// RSA impliziert einen privaten und einen oeffentlichen Schluessel
// RS256 = RSA mit SHA-256 (verwendet u.a. von Google)
const algorithm = 'RS256';

// ECDSA = Elliptic Curve Digital Signature Algorithm
// elliptische Kurven, z.B. y^2 = x^3 + ax + b
// ECDSA hat bei gleicher Sicherheit deutlich kuerzere Schluessel, benoetigt
// aber mehr Rechenleistung. Die Schluessel werden *nicht* uebertragen!
// http://jwt.io kann nur HS256 und RS256
// const algorithm = 'ES384';

// RSASSA-PSS
// const algorithm = 'PS256';

export const isHMAC = () => algorithm.startsWith('HS');

/* global __dirname */
const jwtDir = resolve(__dirname, 'jwt');
const utf8 = 'utf8';

export let privateKey: string | undefined;
if (algorithm.startsWith('HS')) {
    privateKey = undefined;
} else if (algorithm.startsWith('ES')) {
    // PEM-Datei fuer elliptische Kurve durch z.B. OpenSSL
    privateKey = readFileSync(resolve(jwtDir, 'ecdsa.pem'), utf8);
} else {
    // default (z.B. RS256) PEM-Datei durch z.B. OpenSSL
    privateKey = readFileSync(resolve(jwtDir, 'rsa.pem'), utf8);
}
Object.freeze(privateKey);

export let secretOrPublicKey: string;
if (algorithm.startsWith('HS')) {
    secretOrPublicKey = secret;
} else if (algorithm.startsWith('ES')) {
    secretOrPublicKey = readFileSync(resolve(jwtDir, 'ecdsa.public.pem'), utf8);
} else {
    // z.B. RS256
    secretOrPublicKey = readFileSync(resolve(jwtDir, 'rsa.public.pem'), utf8);
}
Object.freeze(secretOrPublicKey);

const issuer = 'https://acme.com/shop/JuergenZimmermann';

// sub(ject) und jti (= JWT Id) muessen individuell gesetzt werden
export const signOptions: SignOptions = {
    // shorthand property
    algorithm,
    expiresIn: '1d',
    // ggf. als DN (= distinguished name) gemaess LDAP
    issuer,
};
Object.freeze(signOptions);

export const verifyOptions: VerifyOptions = {
    algorithms: [algorithm],
    issuer,
};
Object.freeze(verifyOptions);
