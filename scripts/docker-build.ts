/*
 * Copyright (C) 2020 - present Juergen Zimmermann, Hochschule Karlsruhe
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

import { exec } from 'shelljs';

const dockerAccount = 'johanneslauinger';
const imageName = 'rezept';
const imageTag = '1.0.0';

const image = `docker.io/${dockerAccount}/${imageName}:${imageTag}`;

// Dockerfile im aktuellen Verzeichnis
// Download der diversen Layer fuer node:x.y.z-buster und distroless/nodejs
exec(`docker build --tag ${image} .`);
