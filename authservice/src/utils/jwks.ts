import createRemoteJWKSet from 'jose/jwks/remote';
import ms from 'ms';

import { cooldownDurationMins, keycloakHost, realm } from '@/utils/env';
import { errorToText } from './errortotext';
import { consolePrint } from './consoleprint';

const cooldownDuration = ms(`${cooldownDurationMins ? parseInt(cooldownDurationMins) : 60}m`);

const jwksUri = `${keycloakHost}/auth/realms/${realm}/protocol/openid-connect/certs`;

try {
    new URL(jwksUri);
} catch (err: unknown) {
    consolePrint(`JWKS uri '${jwksUri}' is invalid: ${errorToText(err)}`, true);
    process.exit(-1);
}

export const jwks = createRemoteJWKSet(new URL(jwksUri), {
    cooldownDuration,
});
