import jwtVerify from 'jose/jwt/verify';

import type { JWTVerifyOptions } from 'jose/jwt/verify';

import { jwks } from '@/utils/jwks';
import { assertKeycloakTokenPayload, KeycloakTokenPayload } from '@/utils/jwttypeasserts';
import { client, keycloakHost, realm } from '@/utils/env';
import { errorToText } from '@/utils/errortotext';

export interface TokenPayloadRoles {
    payload: KeycloakTokenPayload;
    roles: string[];
}

const verifyOptions: JWTVerifyOptions = {
    audience: client,
    issuer: `${keycloakHost}/auth/realms/${realm}`,
};

export const verifyToken = async (token: string): Promise<TokenPayloadRoles> => {
    const { payload } = await jwtVerify(token, jwks, verifyOptions);

    try {
        assertKeycloakTokenPayload(payload);

        const { resource_access: { [client]: { roles: clientRoles = [] } = {} } = {} } = payload;

        const roles = clientRoles.map(role => `${client}.${role}`);

        return { payload, roles };
    } catch (err: unknown) {
        throw new Error(`Keycloak access token payload malformed: ${errorToText(err)}`);
    }
};
