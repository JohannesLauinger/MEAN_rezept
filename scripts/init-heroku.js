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

// .js, damit das Skript auch in der Heroku-Cloud ausgefuehrt werden kann,
// wo es kein "ts-node" gibt, weil die devDependencies dort nach dem
// Build des Projekts geloescht werden.
// "copyfiles" kann deshalb auch nicht verwendet werden.

const fs = require('fs');
const { copyFileSync, mkdirSync } = fs;
const { copySync } = require('fs-extra');
const { join } = require('path');

const src = 'src';
const dist = 'dist';

const sharedSrc = join(src, 'shared');
const sharedDist = join(dist, 'shared');

const configSrc = join(sharedSrc, 'config');
const configDist = join(sharedDist, 'config');
mkdirSync(configDist, { recursive: true });

// PEM-Dateien fuer JWT kopieren
const jwtPemSrc = join(configSrc, 'jwt');
const jwtPemDist = join(configDist, 'jwt');
mkdirSync(jwtPemDist, { recursive: true });
copySync(jwtPemSrc, jwtPemDist);

// PNG-Datei fuer Neuladen der DB kopieren
const dbSrc = join(sharedSrc, 'db', 'image.png');
const dbDist = join(sharedDist, 'db');
mkdirSync(dbDist, { recursive: true });
copyFileSync(dbSrc, join(dbDist, 'image.png'));

// -----------------------------------------------------------------------------
// E J S
// -----------------------------------------------------------------------------

// Views mit Partials
const viewsSrc = join(src, 'views');
const viewsDist = join(dist, 'views');
mkdirSync(viewsDist, { recursive: true });
copySync(viewsSrc, viewsDist);

// CSS, Bilder, Favicon, manifest.json, robots.txt
const publicSrc = join(src, 'public');
const publicDist = join(dist, 'public');
mkdirSync(publicDist, { recursive: true });
copySync(publicSrc, publicDist);
