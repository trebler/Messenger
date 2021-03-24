import type { ServerResponse } from 'http';

import { respondText } from '@/utils/respondtext';

export const healthz = (res: ServerResponse): void => respondText(res, 200);
