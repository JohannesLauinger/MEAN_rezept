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
 * Das Modul enthält die Funktion, um die Basis-URI für die REST-Schnittstelle
 * zu liefern.
 * @packageDocumentation
 */

import { Cloud, cloud, nodeConfig } from './config';
import type { Request } from 'express';

const port = cloud === undefined ? `:${nodeConfig.port}` : '';

/**
 * die Funktion, um die Basis-URI für die REST--Schnittstelle zu liefern, z.B.
 * für Atom-Links bei HATEOAS oder für den Location-Header.
 *
 * @param req Request-Objekt von Express
 * @returns Die Basis-URI als `string`
 */
export const getBaseUri = (req: Request) => {
    const { protocol, hostname, baseUrl } = req;
    const schema = cloud === Cloud.HEROKU ? 'https' : protocol;
    return `${schema}://${hostname}${port}${baseUrl}`;
};
