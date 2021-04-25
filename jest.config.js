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

// https://jestjs.io/docs/en/configuration
/* global module */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // https://github.com/facebook/jest/tree/master/packages/jest-circus :
    // "The next-gen test runner for Jest"
    testRunner: 'jest-circus/runner',

    bail: true,
    collectCoverageFrom: ['**/*.ts', '!src/index.ts'],
    // default: ["/node_modules/"]
    coveragePathIgnorePatterns: [
        '<rootDir>/.nyc_output/',
        '<rootDir>/.vscode/',
        '<rootDir>/build/',
        '<rootDir>/config/',
        '<rootDir>/coverage/',
        '<rootDir>/dist/',
        '<rootDir>/node_modules/',
        '<rootDir>/scripts/',
        '<rootDir>/temp/',
        '<rootDir>/src/rezept/service/mock/',
        '<rootDir>/src/rezept/graphql',
        '<rootDir>/src/rezept/html',
    ],
    coverageReporters: ['text-summary', 'html'],
    errorOnDeprecated: true,
    testTimeout: 10000, // eslint-disable-line unicorn/numeric-separators-style
    verbose: true,
};
