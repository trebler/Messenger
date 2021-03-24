export const errorToText = (err: unknown): string =>
    err instanceof Error ? err.message : JSON.stringify(err);
