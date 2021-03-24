const {
    env: { PORT: _port = 3000, ORIGIN: origin, DISABLE_AUTH: disableAuth, DEBUG: debug },
} = process;

export const port = typeof _port === 'number' ? _port : parseInt(_port);

export { origin, disableAuth, debug };
