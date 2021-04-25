/*
 * Copyright (C) 2018 - present Juergen Zimmermann, Hochschule Karlsruhe
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
 * Das Modul enthält die Funktionen für EJS einschließlich für die Startseite.
 * @packageDocumentation
 */

import type { Request, Response } from 'express';

/**
 * Funktion für EJS für die Startseite ("index").
 *
 * @param req Request-Objekt von Express mit der URL für EJS
 * @param res Response-Objekt von Express
 */
export const index = (_: Request, res: Response) => {
    res.render('index', { title: 'Beispiel' });
};

export * from './neues-rezept';
export * from './suche';
