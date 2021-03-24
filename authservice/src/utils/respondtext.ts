import { STATUS_CODES } from 'http';
import type { ServerResponse } from 'http';

export const respondText = (
    res: ServerResponse,
    statusCode: number,
    extraHeaders: Record<string, string> = {}
): void => {
    const body = STATUS_CODES[statusCode];

    return res
        .writeHead(statusCode, {
            'Content-Length': body?.length || 0,
            'Content-Type': 'text/plain',
            ...extraHeaders,
        })
        .end(body);
};
