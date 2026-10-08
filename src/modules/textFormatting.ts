import {styleText} from 'node:util'

export const c = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m',
};

export function logFormatError (text:string):void {
    console.log(`${c.red}Error: ${text}${c.reset}`);
}

export function logFormatSuccess (text:string):void {
    console.log(`${c.green}Success: ${text}${c.reset}`);
}

export function logFormatWarning (text:string):void {
    console.log(`${c.yellow}Warning: ${text}${c.reset}`);
}

export function logFormatProcess (text:string):void {
    console.log(`${c.gray}${text}${c.reset}`);
}