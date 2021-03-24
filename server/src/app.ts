import { STATUS_CODES } from 'http';

import {
    App,
    us_listen_socket_close,
    us_listen_socket,
    SHARED_COMPRESSOR,
    WebSocket,
} from 'uWebSockets.js';

import * as env from '@/utils/env';
import { consolePrint, consoleTable } from '@/utils/consoleprint';
import type { WSUserData } from '@/types/wsuserdata';
import { origin } from '@/utils/env';
import { JwtHeader } from '@/utils/jwtheaders';
import { Action, InfoKind, MessageInfo, MessageReceive, MessageSend } from '@/types/message';
import { errorToText } from '@/utils/errortotext';
import { assertMessageReceive } from '@/types/asserts';

const { port, disableAuth, debug } = env;

consoleTable('Service settings', env);

let usSocket: us_listen_socket | undefined;

const wsClients = new Set<WebSocket<WSUserData>>();

const app = App()
    .ws<WSUserData>('/*', {
        compression: SHARED_COMPRESSOR,
        idleTimeout: 0,
        upgrade: (res, req, context) => {
            if (origin && origin !== req.getHeader('origin')) {
                return res.writeStatus('403').end();
            }

            const exp = req.getHeader(JwtHeader.exp);

            if (!disableAuth && (!exp || parseInt(exp) * 1000 < Date.now())) {
                return res.writeStatus('401').end();
            }

            const userName = req.getHeader(JwtHeader.name);
            const userSubject = req.getHeader(JwtHeader.sub);

            return res.upgrade<WSUserData>(
                {
                    userName,
                    userSubject,
                },
                req.getHeader('sec-websocket-key'),
                req.getHeader('sec-websocket-protocol'),
                req.getHeader('sec-websocket-extensions'),
                context
            );
        },
        open: ws => {
            wsClients.add(ws);

            if (debug) {
                const { userName } = ws;

                consolePrint(`WS open: ${userName}`);
                consolePrint(`Total WebSocket clients connected: ${wsClients.size}`);
            }

            const { userSubject } = ws;

            ws.subscribe('broadcast');
            ws.subscribe(`messenger/direct/${userSubject}`);
            ws.subscribe(`messenger/info`);

            return publishUserList();
        },
        close: (ws, code, message) => {
            wsClients.delete(ws);

            if (debug) {
                const { userName } = ws;

                consolePrint(
                    `WS close (code: ${code}, message: ${Buffer.from(
                        message
                    ).toString()}): ${userName}`
                );
                consolePrint(`Total WebSocket clients connected: ${wsClients.size}`);
            }

            return publishUserList();
        },
        message: (ws, message, isBinary) => {
            if (isBinary) {
                return ws.end(1003);
            }

            try {
                const received = JSON.parse(Buffer.from(message).toString()) as unknown;

                assertMessageReceive(received);

                if (received.action === Action.subscribe) {
                    return ws.subscribe(`messenger/rooms/${received.room}`);
                }

                if (received.action === Action.unsubscribe) {
                    return ws.unsubscribe(`messenger/rooms/${received.room}`);
                }

                if (received.action === Action.disconnect) {
                    return ws.end(1000, 'Client requested disconnect');
                }

                const { userSubject } = ws;

                const receivedToSend = (message: MessageReceive): MessageSend => {
                    const commonSend = {
                        userSubject,
                        timestamp: Date.now(),
                    };

                    return {
                        ...message,
                        ...commonSend,
                    };
                };

                if (received.action === Action.publish) {
                    return ws.publish(
                        `messenger/rooms/${received.room}`,
                        JSON.stringify(receivedToSend(received)),
                        false,
                        true
                    );
                }

                if (received.action === Action.direct) {
                    return ws.publish(
                        `messenger/direct/${received.userSubject}`,
                        JSON.stringify(receivedToSend(received)),
                        false,
                        true
                    );
                }

                if (received.action === Action.broadcast) {
                    app.publish('broadcast', JSON.stringify(receivedToSend(received)), false, true);
                    return;
                }
            } catch (err: unknown) {
                consolePrint(`Could not parse command: ${errorToText(err)}`);
            }
        },
    })
    .get('/healthz', res => {
        const body = STATUS_CODES[200];
        res.writeHeader('Content-Type', 'text/plain').end(body);
    })
    .any('/*', res => {
        const body = STATUS_CODES[404];
        res.writeStatus('404').end(body);
    })
    .listen(port, (socket: us_listen_socket | undefined) => {
        if (socket) {
            usSocket = socket;
            consolePrint(`uWebSockets listening on port ${port}`);
        } else {
            consolePrint(`uWebSockets failed to listen on port ${port}`, true);
            process.exit(1);
        }
    });

const publishUserList = (): void => {
    const info: MessageInfo = {
        kind: InfoKind.users,
        items: [...wsClients],
    };

    app.publish(`messenger/info`, JSON.stringify(info));
};

const quitSequence = (signal: string) => {
    consolePrint(`Received ${signal}! Quitting uWebSockets...`);

    if (usSocket) {
        us_listen_socket_close(usSocket);
    }

    consolePrint('Exiting...');
    process.exit(0);
};

process.on('SIGINT', quitSequence);
process.on('SIGTERM', quitSequence);
