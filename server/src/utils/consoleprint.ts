import { hostname } from 'os';

const hostName = hostname();

const prefix = () => `${hostName} (${new Date().toISOString()})`;

export const consolePrint = (text: string, error = false): void => {
    const print = `${prefix()}: ${text}`;
    error ? console.error(print) : console.log(print);
};

export const consoleTable = (name: string, obj: Record<string, unknown>): void => {
    console.log(`${prefix()}: ${name}`);
    console.table(obj);
};
