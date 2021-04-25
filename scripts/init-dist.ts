/*
 * Copyright (C) 2017 - present Juergen Zimmermann, Hochschule Karlsruhe
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

import { dir } from './shared';
import { exec } from 'shelljs';
import { join } from 'path';
import rimraf from 'rimraf';
import { cloud } from '../src/shared/config';

rimraf('server.*', (_: Error) => {});

const { src, dist } = dir;

const sharedSrc = join(src, 'shared');
const sharedDist = join(dist, 'shared');

const configSrc = join(sharedSrc, 'config');
const configDist = join(sharedDist, 'config');

// PEM-Dateien fuer JWT kopieren
const jwtPemSrc = join(configSrc, 'jwt');
const jwtPemDist = join(configDist, 'jwt');
exec(`npx copyfiles --flat ${jwtPemSrc}/* ${jwtPemDist}`);

// PNG-Datei fuer Neuladen der DB kopieren
const dbSrc = join(sharedSrc, 'db', 'image.png');
const dbDist = join(sharedDist, 'db');
exec(`npx copyfiles --flat ${dbSrc} ${dbDist}`);

if (cloud === undefined) {
    // PEM-Dateien und Zertifikatdatei fuer HTTPS kopieren
    exec(
        `npx copyfiles --flat ${configSrc}/*.pem ${configSrc}/*.cer ${configDist}`,
    );
}

// EJS: Views mit Partials, CSS, Bilder, Favicon, manifest.json, robots.txt
const viewsSrc = join(src, 'views');
const publicSrc = join(src, 'public');
exec(`npx copyfiles --up=1 ${viewsSrc}/** ${publicSrc}/** ${dist}`);
