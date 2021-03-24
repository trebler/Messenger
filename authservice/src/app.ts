import { createServer } from 'http';

import { extractToken } from '@/utils/extracttoken';
import { getPayload } from '@/utils/getpayload';
import { consolePrint } from '@/utils/consoleprint';
import { healthz } from '@/handlers/healthz';
import { methodNotAllowed } from '@/handlers/methodnotallowed';
import { notFound } from '@/handlers/notfound';
import { respondError } from '@/utils/respondjson';
import { respondText } from '@/utils/respondtext';
import { port } from '@/utils/env';
import { errorToText } from '@/utils/errortotext';
import { prepareJwtHeaders } from '@/utils/jwtheaders';

const listenPort = port ? parseInt(port) : 3000;

const server = createServer((req, res) => {
    const {
        method,
        url,
        headers: { host },
    } = req;

    if (url && host) {
        const { pathname } = new URL(url, `http://${host}`);

        if (pathname === '/healthz') {
            if (method === 'GET') {
                return healthz(res);
            }

            return methodNotAllowed(res, ['GET']);
        }

        if (pathname === '/verify') {
            if (method === 'GET') {
                const token = extractToken(req);

                if (!token) {
                    return respondError(res, 401, 'Token not provided');
                }

                return void getPayload(token)
                    .then(({ payload, roles }) => {
                        if (Date.now() > payload.exp * 1000) {
                            throw new Error('token has expired');
                        }

                        if (!roles.length) {
                            throw new Error('user does not have roles in the application');
                        }

                        const headers = prepareJwtHeaders({ ...payload, roles });

                        return respondText(res, 200, headers);
                    })
                    .catch((err: unknown) =>
                        respondError(res, 401, `JWT validation failed: ${errorToText(err)}`)
                    );
            }

            return methodNotAllowed(res, ['GET']);
        }
    }

    return notFound(res);
});

const err = await Promise.race([
    new Promise<null>(resolve => server.listen(listenPort, () => resolve(null))),
    new Promise<Error>(resolve => server.once('error', resolve)),
]);

if (err) {
    consolePrint(`HTTP server error occurred: ${err.message}`);
    process.exit(-1);
}

consolePrint(`HTTP server listening on port ${listenPort}`);

const quitServer = () =>
    new Promise<void>((resolve, reject) => server.close(err => (err ? reject(err) : resolve())));

const quitSequence = (signal: string) =>
    void Promise.resolve()
        .then(() => consolePrint(`Received ${signal}! Quitting HTTP server...`))
        .then(quitServer)
        .catch((err: unknown) =>
            consolePrint(`Error occurred in quit sequence: ${errorToText(err)}`, true)
        )
        .finally(() => {
            consolePrint('Exiting...');
            process.exit(0);
        });

process.on('SIGINT', quitSequence);
process.on('SIGTERM', quitSequence);
