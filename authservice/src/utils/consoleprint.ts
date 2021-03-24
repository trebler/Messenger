import { hostname } from 'os';

const hostName = hostname();

export const consolePrint = (text: string, error = false): void => {
    const print = `${hostName} (${new Date().toISOString()}): ${text}`;
    error ? console.error(print) : console.log(print);
};
