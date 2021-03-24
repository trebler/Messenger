import type { ServerResponse } from 'http';

import { respondText } from '@/utils/respondtext';

export const notFound = (res: ServerResponse): void => respondText(res, 404);
