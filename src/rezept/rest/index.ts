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
 * Handler-Funktionen, um die REST-Schnittstelle mit Express zu realisieren. Die
 * einzelnen Handler-Funktionen delegieren an die jeweiligen Methoden der Klassen
 * {@linkcode RezeptRequestHandler} und {@linkcode RezeptFileRequestHandler}.
 * @packageDocumentation
 */

import type { Request, Response } from 'express';
import { RezeptFileRequestHandler } from './rezept-file.request-handler';
import { RezeptRequestHandler } from './rezept.request-handler';

const handler = new RezeptRequestHandler();
const fileHandler = new RezeptFileRequestHandler();

/**
 * Ein rezept wird asynchron anhand seiner ID als Pfadparameter gesucht.
 *
 * Falls es ein solches rezept gibt und `If-None-Match` im Request-Header
 * auf die aktuelle Version des Rezeptes gesetzt war, wird der Statuscode
 * `304` (`Not Modified`) zurückgeliefert. Falls `If-None-Match` nicht
 * gesetzt ist oder eine veraltete Version enthält, wird das gefundene
 * rezept im Rumpf des Response als JSON-Datensatz mit Atom-Links für HATEOAS
 * und dem Statuscode `200` (`OK`) zurückgeliefert.
 *
 * Falls es kein rezept zur angegebenen ID gibt, wird der Statuscode `404`
 * (`Not Found`) zurückgeliefert.
 *
 * @param req Request-Objekt von Express.
 * @param res Leeres Response-Objekt von Express.
 * @returns Leeres Promise-Objekt.
 */
export const findById = (req: Request, res: Response) =>
    handler.findById(req, res);

/**
 * Bücher werden mit Query-Parametern asynchron gesucht. Falls es mindestens
 * ein solches rezept gibt, wird der Statuscode `200` (`OK`) gesetzt. Im Rumpf
 * des Response ist das JSON-Array mit den gefundenen Büchern, die jeweils
 * um Atom-Links für HATEOAS ergänzt sind.
 *
 * Falls es kein rezept zu den Suchkriterien gibt, wird der Statuscode `404`
 * (`Not Found`) gesetzt.
 *
 * Falls es keine Query-Parameter gibt, werden alle Bücher ermittelt.
 *
 * @param req Request-Objekt von Express.
 * @param res Leeres Response-Objekt von Express.
 * @returns Leeres Promise-Objekt.
 */
export const find = (req: Request, res: Response) => handler.find(req, res);

/**
 * Ein neues rezept wird asynchron angelegt. Das neu anzulegende rezept ist als
 * JSON-Datensatz im Request-Objekt enthalten und im Request-Header muss
 * `Content-Type` auf `application\json` gesetzt sein. Wenn es keine
 * Verletzungen von Constraints gibt, wird der Statuscode `201` (`Created`)
 * gesetzt und im Response-Header wird `Location` auf die URI so gesetzt,
 * dass damit das neu angelegte rezept abgerufen werden kann.
 *
 * Falls Constraints verletzt sind, wird der Statuscode `400` (`Bad Request`)
 * gesetzt und genauso auch wenn der Name oder die ISBN-Nummer bereits
 * existieren.
 *
 * @param req Request-Objekt von Express.
 * @param res Leeres Response-Objekt von Express.
 * @returns Leeres Promise-Objekt.
 */
export const create = (req: Request, res: Response) => handler.create(req, res);

/**
 * Ein vorhandenes rezept wird asynchron aktualisiert.
 *
 * Im Request-Objekt von Express muss die ID des zu aktualisierenden Rezeptes
 * als Pfad-Parameter enthalten sein. Außerdem muss im Rumpf das zu
 * aktualisierende rezept als JSON-Datensatz enthalten sein. Damit die
 * Aktualisierung überhaupt durchgeführt werden kann, muss im Header
 * `If-Match` auf die korrekte Version für optimistische Synchronisation
 * gesetzt sein.
 *
 * Bei erfolgreicher Aktualisierung wird der Statuscode `204` (`No Content`)
 * gesetzt und im Header auch `ETag` mit der neuen Version mitgeliefert.
 *
 * Falls die Versionsnummer fehlt, wird der Statuscode `428` (`Precondition
 * required`) gesetzt; und falls sie nicht korrekt ist, der Statuscode `412`
 * (`Precondition failed`). Falls Constraints verletzt sind, wird der
 * Statuscode `400` (`Bad Request`) gesetzt und genauso auch wenn der neue
 * Name oder die neue ISBN-Nummer bereits existieren.
 *
 * @param req Request-Objekt von Express.
 * @param res Leeres Response-Objekt von Express.
 * @returns Leeres Promise-Objekt.
 */
export const update = (req: Request, res: Response) => handler.update(req, res);

/**
 * Ein rezept wird anhand seiner ID-gelöscht, die als Pfad-Parameter angegeben
 * ist. Der zurückgelieferte Statuscode ist `204` (`No Content`).
 *
 * @param req Request-Objekt von Express.
 * @param res Leeres Response-Objekt von Express.
 * @returns Leeres Promise-Objekt.
 */
export const deleteFn = (req: Request, res: Response) =>
    handler.delete(req, res);

/**
 * Zu einem vorhandenen rezept wird eine Binärdatei mit z.B. einem Bild oder
 * einem Video hochgeladen.
 *
 * Im Request-Objekt von Express muss die ID des zu betreffenden Rezeptes
 * als Pfad-Parameter enthalten sein. Außerdem muss im Rumpf die Binärdatei
 * enthalten sein. Bei erfolgreicher Durchführung wird der Statuscode `204`
 * (`No Content`) gesetzt.
 *
 * @param req Request-Objekt von Express.
 * @param res Leeres Response-Objekt von Express.
 */
export const upload = (req: Request, res: Response) =>
    fileHandler.upload(req, res);

/**
 * Zu einem vorhandenen rezept wird eine Binärdatei mit z.B. einem Bild oder
 * einem Video asynchron heruntergeladen. Im Request-Objekt von Express muss
 * die ID des zu betreffenden Rezeptes als Pfad-Parameter enthalten sein.
 *
 * Bei erfolgreicher Durchführung wird der Statuscode `200` (`OK`) gesetzt.
 * Falls es kein rezept mit der angegebenen ID gibt, wird der Statuscode `412`
 * (`Precondition Failed`) gesetzt. Wenn es das rezept zur angegebenen ID zwar
 * gibt, aber zu diesem rezept keine Binärdatei existiert, dann wird der
 * Statuscode `404` (`Not Found`) gesetzt.
 *
 * @param req Request-Objekt von Express.
 * @param res Leeres Response-Objekt von Express.
 * @returns Leeres Promise-Objekt.
 */
export const download = (req: Request, res: Response) =>
    fileHandler.download(req, res);
