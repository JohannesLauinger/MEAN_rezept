# Copyright (C) 2020 - present Juergen Zimmermann
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

# FIXME https://github.com/bazelbuild/rules_docker#nodejs_image

# "Multi-stage Build" mit einem "distroless image"

# https://github.com/GoogleContainerTools/distroless/blob/master/examples/nodejs/Dockerfile
# https://nodejs.org/de/docs/guides/nodejs-docker-webapp
# https://docs.docker.com/engine/reference/builder

# ==============================================================================
#   B u i l d   S t a g e
#
#   Node mit Debian als Basis einschl. GNU C++
#   Python fuer node_gyp: fuer bcrypt und re2
# ==============================================================================

# CAVEAT: Gleiche Version wie distroless wegen Installation von bcrypt und re2 durch node-gyp
# https://www.debian.org/releases: Debian 10 = Buster

#FROM node:15.11.0-buster AS build-env
FROM node:14.16.0-buster AS ts-build-env

# Arbeitsverzeichnis setzen und implizit erstellen
WORKDIR /ts-source

# package.json und package-lock.json in das Arbeitsverzeichnis kopieren
COPY package*.json ./

# Python 3 installieren: wird fuer die Installation von bcrypt und re2 benoetigt
# https://packages.debian.org/buster/python3
RUN apt-get --yes --no-install-recommends install python3=3.7.3-1

RUN npm i -g npm
# dependencies (NICHT: devDependencies) installieren ("clean install")
RUN npm ci --only=production
# TypeScript fuer die Uebersetzung installieren
RUN npm i -D typescript

# Uebersetzen
COPY src ./src
COPY tsconfig.json .
RUN npx tsc

# Konfigurationsdateien kopieren
COPY src/shared/config/jwt ./dist/shared/config/jwt
COPY src/shared/db/image.png ./dist/shared/db
COPY src/shared/config/*.pem ./dist/shared/config/
COPY src/shared/config/*.cer ./dist/shared/config/

# Dateien fuer EJS kopieren
COPY src/views ./dist/views
COPY src/public ./dist/public

# ==============================================================================
#   B u i l d   S t a g e   m i t   J a v a S c r i p t
#
#   Node mit Debian als Basis einschl. GNU C++
#   Python fuer node_gyp: fuer bcrypt und re2
#   dependencies aus package.json installieren
# ==============================================================================
FROM node:14.16.0-buster AS js-build-env

# Arbeitsverzeichnis setzen und implizit erstellen
WORKDIR /source

# package.json und package-lock.json in das Arbeitsverzeichnis kopieren
COPY --from=ts-build-env /ts-source/package*.json ./

# Python 3 installieren: wird fuer die Installation von bcrypt und re2 benoetigt
# dependencies (NICHT: devDependencies) installieren ("clean install")
# https://packages.debian.org/buster/python3
RUN apt-get --yes --no-install-recommends install python3=3.7.3-1

RUN npm ci --only=production

# uebersetzte JS-Dateien aus dem Verzeichnis "dist" nach <WORKDIR>/dist kopieren
# alternativ: "src" uebersetzen (erfordert aber TypeScript)
COPY --from=ts-build-env /ts-source/dist ./dist

# ==============================================================================
#   D i s t r o l e s s   S t a g e
#
#   Node mit "distroless" als Basis
#   node_modules mit dependencies aus package.json
#   eigener, uebersetzter JS-Code
# ==============================================================================
FROM gcr.io/distroless/nodejs-debian10:14
# debug-Image enthaelt Package-Manager, Shell (ash) usw.
#FROM gcr.io/distroless/nodejs-debian10:14-debug

WORKDIR /app
COPY --from=js-build-env /source/package.json .
COPY --from=js-build-env /source/node_modules ./node_modules
COPY --from=js-build-env /source/dist .

# Port freigeben
EXPOSE 3000

# "nonroot"m siehe /etc/passwd
USER 65532

# <Strg>C beim Stoppen des Docker-Containers
STOPSIGNAL SIGINT

# Node-Server durch das Kommando "node server.js" starten
CMD ["server.js"]
