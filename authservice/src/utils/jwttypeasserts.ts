import { AssertionError } from 'assert';

import { createSchema, TsjsonParser } from 'ts-json-validator';
import Ajv from 'ajv';

import { client } from '@/utils/env';

const tokenPayloadBaseSchema = createSchema({
    type: 'object',
    properties: {
        sub: createSchema({ type: 'string', minLength: 1 }),
        exp: createSchema({ type: 'number' }),
        name: createSchema({ type: 'string', minLength: 1 }),
    },
    required: ['sub', 'exp', 'name'],
});

const keycloakTokenPayloadParser = new TsjsonParser(
    createSchema({
        allOf: [
            tokenPayloadBaseSchema,
            createSchema({
                type: 'object',

                properties: {
                    realm_access: createSchema({
                        type: 'object',
                        properties: {
                            roles: createSchema({
                                type: 'array',
                                items: createSchema({ type: 'string' }),
                                minItems: 1,
                            }),
                        },
                        required: ['roles'],
                    }),
                    resource_access: createSchema({
                        type: 'object',
                        properties: {
                            [client]: createSchema({
                                type: 'object',
                                properties: {
                                    roles: createSchema({
                                        type: 'array',
                                        items: createSchema({ type: 'string' }),
                                        minItems: 1,
                                    }),
                                },
                                required: ['roles'],
                            }),
                        },
                    }),
                },
            }),
        ],
    }),
    {
        allErrors: true,
    }
);

const ajv = new Ajv();

interface TokenPayloadCommon {
    sub: string;
    exp: number;
    name: string;
}

export interface KeycloakTokenPayload extends TokenPayloadCommon {
    realm_access?: { roles: string[] };
    resource_access?: { [key: string]: { roles: string[] } };
}

export function assertKeycloakTokenPayload(
    payload: unknown
): asserts payload is KeycloakTokenPayload {
    if (keycloakTokenPayloadParser.validates(payload)) {
        return;
    }

    throw new AssertionError({
        message: ajv.errorsText(keycloakTokenPayloadParser.getErrors(), {
            dataVar: '',
        }),
        actual: payload,
    });
}
