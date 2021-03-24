import { URL } from 'url';

import type { IncomingMessage } from 'http';

import { consolePrint } from '@/utils/consoleprint';
import { errorToText } from '@/utils/errortotext';

export const extractToken = (req: IncomingMessage): string | undefined => {
    const {
        headers: { authorization },
    } = req;

    if (authorization) {
        const { 1: token } = /^Bearer\s(.*)$/i.exec(authorization) || [];

        if (typeof token === 'string') {
            return token;
        }
    }

    const {
        headers: { 'x-forwarded-uri': uri, host },
    } = req;

    if (typeof uri === 'string' && host) {
        try {
            const { searchParams } = new URL(uri, `http://${host}`);

            const accessToken = searchParams.get('access_token');

            if (accessToken) {
                return accessToken;
            }
        } catch (err: unknown) {
            consolePrint(`Error occurred while parsing 'x-forwarded-uri' url: ${errorToText(err)}`);
        }
    }
};
