import fs from "node:fs";
import {type FuncResponse} from './types.js'
import { DatabaseSync,  type SQLInputValue } from 'node:sqlite';
import {logFormatProcess, logFormatError, logFormatSuccess} from './textFormatting.js'

export const db = new DatabaseSync('2br.db');
db.exec('PRAGMA foreign_keys = ON');
/**
 * Key: This is the table your inserting into
 * Value: These are the entries for the table
 */
const insertRows: Record<string, string[]> = {
    book: ['id', 'title', 'cover'],
    user: ['id', 'username', 'password'],
};
// rows.book; // ['id', 'title', 'author', 'cover']


type Table = keyof typeof insertRows;

export function initDb():void {
    logFormatProcess('Loading database from file')
    try {
        db.exec(fs.readFileSync('/home/sammy/Development/2br-back-end/2br.sql', 'utf8'))
    } catch (e) {
        logFormatError(`Database could not be loaded
: ${e}`)
        return
    }
    logFormatSuccess('Database has been loaded')
}

export function insert(table:Table, params:SQLInputValue[]):FuncResponse {
    const columns = insertRows[table];
    const placeholders = Array(columns.length).fill('?').join(', ');
    try {
        db.prepare(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`).run(...params)
    } catch (e) {
        logFormatError(`Could not insert into table: ${table} | ${e}`)
        return  {
            message: "could not insert into table",
            success: false
        }
    }
    logFormatSuccess(`Row has been inserted into table: ${table}`)
    return {
        success: true,
        message: "Successfully inserted into table"
    }
}

export function bookInsert (id:string, authors:string[], cover:string, title:string): FuncResponse {
    db.exec('BEGIN')
    try {
        insert("book", [id, title, cover])
        for (const author of authors) {
            db.prepare(`INSERT OR IGNORE INTO author (name) VALUES(?)`).run(author)
            db.prepare(`INSERT INTO book_author (book_id, author_id) SELECT ?, id FROM author WHERE name = ?`)
                .run(id, author)
        }
        db.exec('COMMIT')
    } catch (err) {
        db.exec('ROLLBACK')
        logFormatError(`Database operation failed: ${err}`)
        return {
            success: false,
            message: "Could not insert book",
        }
    }
    return {
        success: true,
        message: "Successfully inserted into book"
    }
}