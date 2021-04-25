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

// Aufruf:   node-ts port-forward.ts rezept|mongodb|mailserver

import { exec } from 'shelljs';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(0));
const values = argv._;
const service = values[2];

const namespace = 'acme';

switch (service) {
    case undefined:
    case 'rezept':
        exec(`kubectl port-forward service/rezept 3000 --namespace ${namespace}`);
        break;

    case 'mongodb':
        exec(`kubectl port-forward service/${service} 27017 --namespace ${namespace}`);
        break;

    case 'mailserver':
        exec(`kubectl port-forward service/${service} 5025 5080 --namespace ${namespace}`);
        break;

    default:
        console.log('node-ts port-forward.ts rezept|mongodb|mailserver');
}
