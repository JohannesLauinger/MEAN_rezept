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

import { logger } from '../../shared';
import { users } from './users';

/**
 * Das Interface `User` beschreibt die Properties zu einer vorhandenen
 * Benutzerkennung.
 */
export interface User {
    id: string;
    username: string;
    password: string;
    email: string;
    roles?: string[];
}

/**
 * Die Klasse `UserService` implementiert Funktionen, um Objekte vom Typ
 * {@linkcode User} zu suchen.
 */
export class UserService {
    constructor() {
        logger.info('UsersService: users=%o', users);
    }

    /**
     * Ein {@linkcode User} wird anhand seines Benutzernamens gesucht.
     *
     * @param username Benutzername.
     * @return Ein Objekt vom Typ {@linkcode User}, falls es einen Benutzer
     *  mit dem angegebenen Benutzernamen gibt. Sonst `undefined`.
     */
    findByUsername(username: string) {
        return users.find((u: User) => u.username === username);
    }

    /**
     * Ein {@linkcode User} wird anhand seiner ID gesucht.
     *
     * @param id ID des gesuchten Benutzers.
     * @return Ein Objekt vom Typ {@linkcode User}, falls es einen Benutzer
     *  mit der angegebenen ID gibt. Sonst `undefined`.
     */
    findById(id: string) {
        return users.find((user: User) => user.id === id);
    }

    /**
     * Ein {@linkcode User} wird anhand seiner Emailadresse gesucht.
     *
     * @param email Emailadresse.
     * @return Ein Objekt vom Typ {@linkcode User}, falls es einen Benutzer
     *  mit der angegebenen Emailadresse gibt. Sonst `undefined`.
     */
    findByEmail(email: string) {
        return users.find((user: User) => user.email === email);
    }
}
