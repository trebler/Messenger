import type { ServerResponse } from 'http';

import { respondText } from '@/utils/respondtext';

export const methodNotAllowed = (res: ServerResponse, allowed: string[]): void =>
    respondText(res, 405, { Allow: allowed.join(',') });
