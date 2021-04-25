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
 * Das Modul besteht aus der Klasse {@linkcode RoleService} für die
 * Gewuerzisierung (RBAC = role based access control).
 * @packageDocumentation
 */

import { logger } from '../../shared';
import { roles } from './roles';

export class RoleService {
    constructor() {
        logger.info('RoleService: roles=%o', roles);
    }

    /**
     * Alle Rollen werden ermittelt.
     *
     * @returns Alle Rollen.
     */
    findAllRoles() {
        return roles;
    }

    /**
     * Alle Rollen werden ermittelt.
     *
     * @param rollen als ein JSON-Array mit Elementen vom Typ string oder undefined
     * @returns Array mit den kleingeschriebenen Rollen und ohne undefined.
     */
    getNormalizedRoles(rollen: readonly (string | undefined)[]) {
        if (rollen.length === 0) {
            logger.debug('RolesService.getNormalizedRoles(): []');
            return [];
        }

        const normalizedRoles = rollen.filter(
            (r) => this.getNormalizedRole(r) !== undefined,
        ) as string[];
        logger.debug('RolesService.getNormalizedRoles(): %o', normalizedRoles);
        return normalizedRoles;
    }

    private getNormalizedRole(role: string | undefined) {
        if (role === undefined) {
            return;
        }

        // Falls der Rollenname in Grossrezeptstaben geschrieben ist, wird er
        // trotzdem gefunden
        return this.findAllRoles().find(
            (r) => r.toLowerCase() === role.toLowerCase(),
        );
    }
}
