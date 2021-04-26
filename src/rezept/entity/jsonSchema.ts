import type { GenericJsonSchema } from './GenericJsonSchema';

export const MAX_RATING = 5;

export const jsonSchema: GenericJsonSchema = {
    $schema: 'https://json-schema.org/draft/2019-09/schema',
    $id: 'https://acme.com/buch.json#',
    title: 'rezept',
    description: 'Eigenschaften eines Rezeptes: Typen und Einschraenkungen',
    type: 'object',
    properties: {
        /* eslint-disable @typescript-eslint/naming-convention */
        _id: {
            type: 'string',
            pattern:
                '^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$',
        },
        __v: {
            type: 'number',
            minimum: 0,
        },
        /* eslint-enable @typescript-eslint/naming-convention */
        name: {
            type: 'string',
            pattern: '^\\w.*',
        },
        schwierigkeit: {
            type: 'number',
            minimum: 0,
            maximum: MAX_RATING,
        },
        art: {
            type: 'string',
            enum: ['SNACK', 'HAUPTMAHLZEIT', ''],
        },
        koch: {
            type: 'string',
            enum: ['STEFFEN_HENSSLER', 'JOHANN_LAFER', ''],
        },
        preis: {
            type: 'number',
            minimum: 0,
        },
        schaerfe: {
            type: 'number',
            exclusiveMinimum: 0,
            exclusiveMaximum: 1,
        },
        verfuegbar: { type: 'boolean' },
        // https://github.com/ajv-validator/ajv-formats
        datum: { type: 'string', format: 'date' },
        hinweis: { type: 'string'},
        // https://github.com/ajv-validator/ajv-formats
        homepage: { type: 'string', format: 'uri' },
        zutaten: {
            type: 'array',
            items: { type: 'string' },
        },
        gewuerze: {
            type: 'array',
            items: { type: 'object' },
        },
    },
    // hinweis ist NUR beim Neuanlegen ein Pflichtfeld
    // Mongoose bietet dazu die Funktion MyModel.findByIdAndUpdate()
    required: ['name', 'art', 'koch'],
    errorMessage: {
        properties: {
            name:
                'Ein Rezeptname muss mit einem Rezeptstaben, einer Ziffer oder _ beginnen.',
            schwierigkeit: 'Eine Bewertung muss zwischen 0 und 5 liegen.',
            art: 'Die Art eines Rezeptes muss HAUPTMAHLZEIT oder SNACK sein.',
            koch:
                'Der Koch eines Rezeptes muss JOHANN_LAFER oder STEFFEN_HENSSLER sein.',
            preis: 'Der Preis darf nicht negativ sein.',
            schaerfe: 'Der Schaerfe muss ein Wert zwischen 0 und 1 sein.',
            verfuegbar: '"verfuegbar" muss auf true oder false gesetzt sein.',
            datum: 'Das Datum muss im Format yyyy-MM-dd sein.',
            hinweis: 'Die ISBN-Nummer ist nicht korrekt.',
            homepage: 'Die URL der Homepage ist nicht korrekt.',
        },
    },
    additionalProperties: false,
};
