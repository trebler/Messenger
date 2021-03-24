import { AssertionError } from 'assert';

import { createSchema, TsjsonParser } from 'ts-json-validator';
import type { Validated } from 'ts-json-validator';
import type { SchemaLike } from 'ts-json-validator/dist/json-schema';

import Ajv from 'ajv';

import type { MessageReceive } from '@/types/message';
import { Action } from '@/types/message';

const ajv = new Ajv();

const messageReceiveParser = new TsjsonParser(
    createSchema({
        oneOf: [
            createSchema({
                type: 'object',
                properties: {
                    action: createSchema({ enum: [Action.subscribe, Action.unsubscribe] as const }),
                    room: createSchema({ type: 'string', minLength: 1 }),
                },
                required: ['action', 'room'],
            }),
            createSchema({
                type: 'object',
                properties: {
                    action: createSchema({ const: Action.disconnect }),
                },
                required: ['action'],
            }),
            createSchema({
                type: 'object',
                properties: {
                    action: createSchema({ const: Action.direct }),
                    userSubject: createSchema({ type: 'string', minLength: 1 }),
                    message: createSchema({ type: 'string' }),
                },
                required: ['action', 'userSubject', 'message'],
            }),
            createSchema({
                type: 'object',
                properties: {
                    action: createSchema({ const: Action.publish }),
                    room: createSchema({ type: 'string', minLength: 1 }),
                    message: createSchema({ type: 'string' }),
                },
                required: ['action', 'room', 'message'],
            }),
            createSchema({
                type: 'object',
                properties: {
                    action: createSchema({ const: Action.broadcast }),
                    message: createSchema({ type: 'string' }),
                },
                required: ['action', 'message'],
            }),
        ],
    }),
    {
        allErrors: true,
    }
);

function assertWithParser<T extends SchemaLike>(
    params: unknown,
    parser: TsjsonParser<T>
): asserts params is Validated<typeof parser.schema> {
    if (parser.validates(params)) {
        return;
    }

    throw new AssertionError({
        message: `Validation failed: ${ajv.errorsText(parser.getErrors(), {
            dataVar: '',
        })}`,
        actual: params,
    });
}

export function assertMessageReceive(params: unknown): asserts params is MessageReceive {
    return assertWithParser(params, messageReceiveParser);
}
