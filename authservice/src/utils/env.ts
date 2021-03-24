export const {
    env: {
        CLIENT: client = '',
        KEYCLOAK_HOST: keycloakHost = '',
        REALM: realm = '',
        TOKEN_CACHE_SIZE: tokenCacheSize,
        COOLDOWN_DURATION_MINS: cooldownDurationMins,
        PORT: port,
    },
} = process;
