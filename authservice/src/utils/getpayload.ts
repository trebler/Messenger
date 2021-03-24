import lruCache from 'lru-cache';

import { verifyToken } from '@/utils/verifytoken';
import type { TokenPayloadRoles } from '@/utils/verifytoken';

import { tokenCacheSize } from '@/utils/env';

const cacheSize = tokenCacheSize ? parseInt(tokenCacheSize) : 1000;

const cache = new lruCache<string, TokenPayloadRoles>(cacheSize);

export const getPayload = async (token: string): Promise<TokenPayloadRoles> => {
    const cached = cache.get(token);

    if (cached) {
        return cached;
    }

    const payload = await verifyToken(token);

    cache.set(token, payload);

    return payload;
};
