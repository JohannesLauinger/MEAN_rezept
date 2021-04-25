/*
 * Copyright (C) 2021 - present Juergen Zimmermann, Hochschule Karlsruhe
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
 * Das Modul enthält die Information, ob die Anwendung überhaupt in einer Cloud
 * läuft, und ggf. ob es sich um _Heroku_ oder _OpenShift_ handelt.
 * @packageDocumentation
 */

import RE2 from 're2';
import { hostname } from 'os';

/**
 * Aufzählungstyp für die beiden Cloud-Varianten _Heroku_ und _OpenShift_.
 */
export enum Cloud {
    HEROKU = 'heroku',
    OPENSHIFT = 'openshift',
}

// https://github.com/google/re2
// https://github.com/uhop/node-re2
const herokuRegexp = new RE2(
    '[\\dA-Fa-f]{8}-[\\dA-Fa-f]{4}-[\\dA-Fa-f]{4}-[\\dA-Fa-f]{4}-[\\dA-Fa-f]{12}',
    'u',
);
const computername = hostname();

/**
 * Information, ob die Anwendung überhaupt in einer Cloud läuft, und ggf. ob es
 * sich um _Heroku_ oder _OpenShift_ handelt.
 * Der Rechnername ist bei
 * - Heroku:    eine UUID
 * - OpenShift: <Projektname_aus_package.json>-\<Build-Nr>-\<random-alphanumeric-5stellig>
 */
export let cloud: Cloud | undefined;

if (herokuRegexp.test(computername)) {
    cloud = Cloud.HEROKU;
} else {
    const openshiftRegexp = new RE2('beispiel-\\d+-w{5}', 'u');
    if (openshiftRegexp.test(computername)) {
        cloud = Cloud.OPENSHIFT;
    }
}
