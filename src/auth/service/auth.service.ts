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
 * Das Modul besteht aus der Klasse {@linkcode AuthService} für die
 * Authentifizierung.
 * @packageDocumentation
 */

import { NoTokenError, UserInvalidError } from './errors';
import {
    logger,
    privateKey,
    secret,
    secretOrPublicKey,
    signOptions,
    verifyOptions,
} from '../../shared';
import { sign, verify } from 'jsonwebtoken';
import { RoleService } from './role.service';
import type { SignOptions } from 'jsonwebtoken';
import type { User } from './user.service';
import { UserService } from './user.service';
// Alternativen zu bcrypt:
//  scrypt: https://www.tarsnap.com/scrypt.html
//  Argon2: https://github.com/p-h-c/phc-winner-argon2
//  SHA-Algorithmen und PBKDF2 sind anfaelliger bei Angriffen mittels GPUs
//  http://blog.rangle.io/how-to-store-user-passwords-and-overcome-security-threats-in-2017
//  https://stormpath.com/blog/secure-password-hashing-in-node-with-argon2
import { compareSync } from 'bcrypt';
// UUID v4: random
// https://github.com/uuidjs/uuid
import { v4 as uuid } from 'uuid';

interface LoginResult {
    token: string;
    expiresIn: number | string | undefined;
    roles?: readonly string[];
}

/**
 * Die Klasse `AuthService` implementiert die Funktionen für die
 * Authentifizierung wie z.B. Einloggen und Validierung von JSON Web Tokens.
 */
export class AuthService {
    private readonly roleService = new RoleService();

    private readonly userService = new UserService();

    /**
     * Benutzername und Passwort werden übergeben, um sich einzuloggen.
     *
     * Falls das Einloggen erfolgreich ist, wird ein JSON-Objekt mit dem
     * _JSON Web Token_, dem Zeitstempel für das Ablaufdatum (`expiresIn`)
     * und den Rollen als JSON-Array zurückgeliefert.
     *
     * Falls das Einloggen nicht erfolgreich war, wird undefined zurückgeliefert.
     *
     * @param username Benutzername.
     * @param password Passwort.
     */
    login(username: string | undefined, password: string | undefined) {
        // ein verschluesseltes Passwort fuer Testzwecke ausgeben
        // mittels genSaltSync und hashSync aus bcrypt
        // const salt = genSaltSync();
        // const hash = hashSync('mypassword', salt);
        // logger.warn('Verschluesseltes Password: %s', hash);

        logger.silly('username: %s', username);
        if (username === undefined || password === undefined) {
            return;
        }
        const user = this.userService.findByUsername(username);
        logger.debug('user: %o', user);

        logger.silly('password: %s', password);
        if (!this.checkPassword(user, password)) {
            return;
        }

        const secretOrPrivateKey =
            privateKey === undefined ? secret : privateKey;
        const options: SignOptions = {
            // spread properties
            ...signOptions,
            subject: user?.id,
            jwtid: uuid(),
        };
        const token = sign({}, secretOrPrivateKey, options);

        const result: LoginResult = {
            token,
            expiresIn: options.expiresIn,
            roles: user?.roles,
        };
        logger.debug('AuthService.login(): result=%o', result);
        return result;
    }

    /**
     * Ein _JSON Web Token_ soll validiert werden.
     *
     * Falls der Token gültig ist, wird ein Objekt vom Typ {@linkcode User} mit
     * dem zugehörigen User zurückgeliefert.
     *
     * Falls das Einloggen nicht erfolgreich war, wird ein Error geworfen:
     *
     * - `TokenExpiredError` durch `verify()` von `jsonwebtoken`.
     * - `JsonWebTokenError?  durch `verify()` von `jsonwebtoken`.
     * - {@linkcode NoTokenError}, falls es keinen Token gibt.
     * - {@linkcode UserInvalidError}, falls es den zugehörigen User nicht (mehr) gibt.
     *
     * TokenExpiredError und JsonWebTokenError sind gemäß OAuth2 implementiert:
     *
     * - https://tools.ietf.org/html/rfc6749#section-5.2
     * - https://tools.ietf.org/html/rfc6750#section-3.1
     *
     * @param token JSON Web Token
     * @returns ein Objekt vom Typ {@linkcode User}
     */
    validateJwt(token: string | undefined) {
        // https://tools.ietf.org/html/rfc7230
        // http://www.w3.org/Protocols/rfc2616/rfc2616-sec4.html#sec4.2

        // Keine "Timing Attack" durch zeichenweises Vergleichen, wenn
        // unterschiedliche Antwortzeiten bei 403 entstehen
        // https://snyk.io/blog/node-js-timing-attack-ccc-ctf
        // Eine von Error abgeleitete Klasse hat die Property "message"
        // eslint-disable-next-line security/detect-possible-timing-attacks, security-node/detect-possible-timing-attacks
        if (token === undefined) {
            logger.silly(
                'AuthService.validateJwt(): Fehler beim Header-Field Authorization',
            );
            throw new NoTokenError();
        }
        logger.silly('AuthService.validateJwt(): token=%s', token);

        const decoded = verify(token, secretOrPublicKey, verifyOptions);
        logger.debug(
            'AuthService.validateJwt(): Der JWT-Token wurde decodiert: %s',
            decoded,
        );

        // Destructuring fuer sub(ject): decoded ist vom Typ "object | string"
        const tmpDecoded: unknown = decoded;
        const { sub } = tmpDecoded as { sub: string };
        logger.debug('AuthService.validateJwt(): sub=%s', sub);

        const user = this.userService.findById(sub);
        if (user === undefined) {
            logger.silly('AuthService.validateJwt(): Falsche User-Id: %s', sub);
            throw new UserInvalidError(`Falsche User-Id: ${sub}`);
        }

        // Request-Objekt um user erweitern:
        // fuer die spaetere Ermittlung der Rollen nutzen
        // "Type Merging" in TypeScript: siehe tsconfig.json
        // https://www.typescriptlang.org/docs/handbook/declaration-merging.html
        return user;
    }

    /**
     * Hat ein eingeloggter User mindestens eine der angegebenen Rollen?
     *
     * @param user JSON-Objekt zum Interface {@linkcode User}.
     * @param roles JSON-Array mit den Rollen als string.
     * @returns true, falls mindestens eine Rolle beim User vorhanden ist.
     *  Sonst false.
     */
    hasAnyRole(user: User, roles: readonly string[]) {
        const rolesNormalized = this.roleService.getNormalizedRoles(roles);
        const result = this.userHasAnyRole(user, rolesNormalized);
        logger.debug('AuthService.hasAnyRole(): %s', result);
        return result;
    }

    private userHasAnyRole(user: User, roles: readonly string[]) {
        if (user.roles === undefined) {
            return false;
        }
        if (roles.length === 0) {
            return true;
        }

        const userRoles = user.roles;
        return roles.filter((role) => userRoles.includes(role)).length > 0;
    }

    private checkPassword(user: User | undefined, password: string) {
        if (user === undefined) {
            logger.debug('AuthService.checkPassword(): Kein User-Objekt');
            return false;
        }

        // Beispiel:
        //  $2a$12$50nIBzoTSmFEDGI8nM2iYOO66WNdLKq6Zzhrswo6p1MBmkER5O/CO
        //  $ als Separator
        //  2a: Version von bcrypt
        //  12: 2**12 Iterationen
        //  die ersten 22 Zeichen kodieren einen 16-Byte Wert fuer den Salt
        //  danach das chiffrierte Passwort
        const result = compareSync(password, user.password);
        logger.debug('AuthService.checkPassword(): %s', result);
        return result;
    }
}
