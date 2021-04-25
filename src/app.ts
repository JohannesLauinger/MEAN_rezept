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
 * Das Modul besteht vor allem aus der Klasse internen Klasse `App`, um die
 * Express-App zu bauen und bereitzustellen. Die Express-App wird dann im
 * Objekt {@linkcode app} exportiert.
 * @packageDocumentation
 */

import {
    create,
    deleteFn,
    download,
    find,
    findById,
    update,
    upload,
} from './rezept/rest';
import {
    devMode,
    enablePlayground,
    internalError,
    logRequestHeader,
    logger,
    morganFormat,
    notFound,
    notYetImplemented,
    rateLimitOptions,
    validateContentType,
    validateUUID,
} from './shared';
import { index, neuesRezept, suche } from './rezept/html';
import { isAdmin, isAdminMitarbeiter, login, validateJwt } from './auth';
// Einlesen von application/json im Request-Rumpf
// Fuer multimediale Daten (Videos, Bilder, Audios): raw-body
import { json, urlencoded } from 'body-parser';
import { resolvers, typeDefs } from './rezept/graphql';
import { ApolloServer } from 'apollo-server-express';
import type { ApolloServerExpressConfig } from 'apollo-server-express';
import bearerToken from 'express-bearer-token';
import compression from 'compression';
import express from 'express';
import { helmetHandlers } from './security';
import { join } from 'path';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import responseTime from 'response-time';

const { Router } = express; // eslint-disable-line @typescript-eslint/naming-convention

const limiter = rateLimit(rateLimitOptions);

// hochgeladene Dateien als Buffer im Hauptspeicher halten
// const storage = multer.memoryStorage()
// const uploader = multer({storage})

const apiPath = '/api';

/**
 * Die Pfade, die es an der REST-, GraphQL- und HTML-Schnittstelle gibt,
 * werden in einem JSON-Objekt gebündelt.
 */
export const PATHS = {
    rezepte: `${apiPath}/rezepte`,
    koche: `${apiPath}/koche`,
    login: `${apiPath}/login`,
    graphql: '/graphql',
    html: '/html',
};

// Express als Middleware = anwendungsneutrale Dienste-/Zwischenschicht,
// d.h. Vermittler zwischen Request und Response.
// Alternativen zu Express (hat die hoechsten Download-Zahlen):
// * Nest (NestJS): auf Basis von TypeScript und Express
// * Fastify: in Anlehnung an die Konzepte von Hapi und Express
// * Hapi: von Walmart
// * Restify: von Netflix
// * Loopback: von IBM, in TypeScript implementiert, ausgehend von Express
// * Koa: von den urspruengl. Express-Entwicklern
// * Sails: baut auf Express auf, Waterline als ORM, z.B. mit PostgreSQL
// * Kraken: baut auf Express auf
//           von PayPal
//           verwaltet von der Node.js Foundation
//           genutzt von Oracle mit Oracle JET

/**
 * Die Klasse `App` baut im Konstruktor die Express-App, die dann als
 * readonly-Property mit public-Sichtbarkeit zugreifbar ist.
 */
class App {
    /**
     * Das (App- bzw. Express-Objekt) [http://expressjs.com/en/api.html] ist
     * zuständig für:
     *
     * - Konfiguration der Middleware und
     * - Routing
     */
    readonly app = express();

    constructor() {
        this.config();
        this.routes();
    }

    private config() {
        if (devMode) {
            // Logging der Requests in der Console
            this.app.use(
                // Protokollierung des Requests mit Morgan
                morgan(morganFormat),
                // Protokollierung des Request-Headers mit Winston
                logRequestHeader,
                // Protokollierung der Response Time
                responseTime((_req, _res, time) =>
                    logger.debug('Response time: %d ms', time),
                ),
            );
        }

        this.app.use(
            bearerToken(),

            // Spread Operator ab ES 2015
            ...helmetHandlers,

            // falls CORS fuer die Webanwendung notwendig ist:
            // corsHandler,

            // GZIP-Komprimierung implizit unterstuetzt durch Chrome, FF, ...
            //   Accept-Encoding: gzip
            // Alternative: z.B. nginx als Proxy-Server und dort komprimieren
            compression(),
            limiter,
        );
    }

    private routes() {
        this.rezepteRoutes();
        this.kochRoutes();
        this.loginRoutes();
        this.rezeptGraphqlRoutes();
        this.htmlRoutes();

        this.app.get('*', notFound);
        this.app.use(internalError);
    }

    private rezepteRoutes() {
        // vgl: Spring WebFlux.fn
        // https://expressjs.com/en/api.html#router
        // Beispiele fuer "Middleware" bei Express:
        //  * Authentifizierung und Gewuerzisierung
        //  * Rumpf bei POST- und PUT-Requests einlesen
        //  * Logging, z.B. von Requests
        //  * Aufruf der naechsten Middleware-Funktion
        // d.h. "Middleware" ist eine Variation der Patterns
        //  * Filter (Interceptoren) und
        //  * Chain of Responsibility
        // Ausblick zu Express 5 (z.Zt. noch als Alpha-Release):
        //  * Router als eigenes Modul https://github.com/pillarjs/router
        //  * Zusaetzliche Syntax beim Routing
        //  * Promises statt Callbacks
        //  * Verbesserte Handhabung von Query Strings
        //  * noch keine .d.ts-Datei
        const router = Router(); // eslint-disable-line new-cap
        router
            .route('/')
            // https://expressjs.com/en/api.html#app.get.method
            .get(find)
            .post(
                validateJwt,
                validateContentType,
                isAdminMitarbeiter,
                json(),
                create,
            );

        const idParam = 'id';
        router
            .param(idParam, validateUUID)
            .get(`/:${idParam}`, findById)
            .put(
                `/:${idParam}`,
                validateJwt,
                validateContentType,
                isAdminMitarbeiter,
                json(),
                update,
            )
            .delete(`/:${idParam}`, validateJwt, isAdmin, deleteFn)
            .put(`/:${idParam}/file`, validateJwt, isAdminMitarbeiter, upload)
            .get(`/:${idParam}/file`, download);

        this.app.use(PATHS.rezepte, router);
    }

    private kochRoutes() {
        const router = Router(); // eslint-disable-line new-cap
        router.get('/', notYetImplemented);
        this.app.use(PATHS.koche, router);
    }

    private loginRoutes() {
        const router = Router(); // eslint-disable-line new-cap
        router.route('/').post(
            urlencoded({
                extended: false,
                type: 'application/x-www-form-urlencoded',
            }),
            login,
        );
        this.app.use(PATHS.login, router);
    }

    private rezeptGraphqlRoutes() {
        // https://www.apollographql.com/docs/apollo-server/data/resolvers/#passing-resolvers-to-apollo-server
        const config: ApolloServerExpressConfig = {
            typeDefs,
            resolvers,
            playground: enablePlayground,
            introspection: enablePlayground,
        };
        const apollo = new ApolloServer(config);
        // https://www.apollographql.com/docs/apollo-server/integrations/middleware/#applying-middleware
        apollo.applyMiddleware({ app: this.app, path: PATHS.graphql });
    }

    private htmlRoutes() {
        const router = Router(); // eslint-disable-line new-cap
        router.route('/').get(index);
        router.route('/suche').get(suche);
        router.route('/neues-rezept').get(neuesRezept);
        this.app.use(PATHS.html, router);

        // Alternativen zu Pug: EJS, Handlebars, ...
        // https://github.com/expressjs/express/wiki#template-engines
        this.app.set('view engine', 'ejs');
        // __dirname ist das Verzeichnis ".../dist/server"
        /* global __dirname */
        this.app.set('views', join(__dirname, 'views'));
        this.app.use(express.static(join(__dirname, 'public')));
    }
}

/**
 * Das Objekt mit der Express-App.
 */
export const { app } = new App();
