import type { ServerResponse } from 'http';

export const respondJson = (
    res: ServerResponse,
    statusCode: number,
    json: Record<string, unknown>
): void =>
    res
        .writeHead(statusCode, {
            'Content-Type': 'application/json',
        })
        .end(JSON.stringify(json));

export const respondError = (res: ServerResponse, statusCode: number, message: string): void =>
    respondJson(res, statusCode, {
        error: message,
    });
