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
 * Das Modul besteht aus den Handler-Funktionen für die Authentifizierung an der
 * REST-Schnittstelle, die in der internen Klasse `AuthenticationRequestHandler`
 * gebündelt implementiert sind.
 * @packageDocumentation
 */

import { AuthService, NoTokenError, UserInvalidError } from '../service';
import { HttpStatus, logger } from '../../shared';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';

/**
 * Die Handler-Klasse fasst die Handler-Funktionen für die Authentifizierung
 * zusammen.
 */
class AuthenticationRequestHandler {
    private readonly authService = new AuthService();

    /**
     * Im Rumpf des Request-Objekts stehen Benutzername und Passwort, um sich
     * einzuloggen.
     *
     * Falls das Einloggen erfolgreich war, wird der Statuscode `200` (`OK`)
     * zurückgeliefert. Im Rumpf steht dann der _JSON Web Token_, der
     * Zeitstempel für das Ablaufdatum (`expiresIn`) und ein JSON-Array mit den
     * Rollen.
     *
     * Falls das Einloggen nicht erfolgreich war, wird der Statuscode `401`
     * (`Unauthorized`) zurückgeliefert.
     *
     * @param req Request-Objekt von Express.
     * @param res Leeres Response-Objekt von Express.
     */
    login(req: Request, res: Response) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const {
            username,
            password,
        }: {
            username: string | undefined;
            password: string | undefined;
        } = req.body;

        const loginResult = this.authService.login(username, password);
        if (loginResult === undefined) {
            logger.debug('AuthRequestHandler.login(): 401');
            res.sendStatus(HttpStatus.UNAUTHORIZED);
            return;
        }

        logger.debug('AuthRequestHandler.login(): %o', loginResult);
        res.json(loginResult).status(HttpStatus.OK);
    }

    /**
     * Im Request-Objekts ist ein zu validierender Token enthalten.
     *
     * Falls das Einloggen nicht erfolgreich war, wird der Statuscode `401`
     * (`Unauthorized`) zurückgeliefert.
     *
     * @param req Request-Objekt von Express.
     * @param res Leeres Response-Objekt von Express.
     */
    validateJwt(req: Request, res: Response, next: NextFunction) {
        try {
            req.user = this.authService.validateJwt(req.token);
        } catch (err: unknown) {
            if (err instanceof TokenExpiredError) {
                logger.debug('AuthRequestHandler.validateJwt(): 401');
                res.header(
                    'WWW-Authenticate',
                    `Bearer realm="acme.com", error="invalid_token", error_description="${err.message}"`,
                );
                res.status(HttpStatus.UNAUTHORIZED).send(err.message);
                return;
            }

            // message bei JsonWebTokenError:
            //  jwt malformed
            //  jwt signature is required
            //  invalid signature
            //  jwt audience invalid. expected: [OPTIONS AUDIENCE]
            //  jwt issuer invalid. expected: [OPTIONS ISSUER]
            //  jwt id invalid. expected: [OPTIONS JWT ID]
            //  jwt subject invalid

            if (
                err instanceof JsonWebTokenError ||
                err instanceof NoTokenError ||
                err instanceof UserInvalidError
            ) {
                logger.debug(
                    'AuthRequestHandler.validateJwt(): 401: %s, %s',
                    err.name,
                    err.message,
                );
                res.sendStatus(HttpStatus.UNAUTHORIZED);
                return;
            }

            res.sendStatus(HttpStatus.INTERNAL_ERROR);
            return;
        }

        logger.debug('AuthRequestHandler.validateJwt(): ok');
        next();
    }
}

const handler = new AuthenticationRequestHandler();

/**
 * Im Rumpf des Request-Objekts stehen Benutzername und Passwort, um sich
 * einzuloggen.
 *
 * Falls das Einloggen erfolgreich war, wird der Statuscode `200` (`OK`)
 * zurückgeliefert. Im Rumpf steht dann der _JSON Web Token_, der Zeitstempel
 * für das Ablaufdatum (`expiresIn`) und ein JSON-Array mit den Rollen.
 *
 * Falls das Einloggen nicht erfolgreich war, wird der Statuscode `401`
 * (`Unauthorized`) zurückgeliefert.
 *
 * @param req Request-Objekt von Express.
 * @param res Leeres Response-Objekt von Express.
 */
export const login = (req: Request, res: Response) => handler.login(req, res);

/**
 * Im Request-Objekts ist ein zu validierender Token enthalten.
 *
 * Falls das Einloggen nicht erfolgreich war, wird der Statuscode `401`
 * (`Unauthorized`) zurückgeliefert.
 *
 * @param req Request-Objekt von Express.
 * @param res Leeres Response-Objekt von Express.
 */
export const validateJwt = (req: Request, res: Response, next: NextFunction) =>
    handler.validateJwt(req, res, next);
