import fs from "node:fs";
import sqlite3 from'sqlite3';
import {logFormatProcess, logFormatError, logFormatSuccess} from './textFormatting.js'



export function initDb():void {
    const db = new sqlite3.Database('2br.db')
    logFormatProcess('Loading database from file')
    try {
        db.serialize(() => {
            db.run(fs.readFileSync('/home/sammy/Development/2br-back-end/2br.sql', 'utf8'))
        })
    } catch (e) {
        logFormatError('Database could not be loaded\n:')
    }
    logFormatSuccess('Database has been loaded')
}