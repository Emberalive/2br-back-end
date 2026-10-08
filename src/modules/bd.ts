import fs from "node:fs";
import { DatabaseSync,  type SQLInputValue } from 'node:sqlite';
import { randomUUID as uuid } from 'node:crypto';
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
    author: ['name'],
    book_author: ['book_id', 'author_id']
};


type Table = keyof typeof insertRows;

// rows.books; // ['id', 'title', 'author', 'cover']
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

export function insert(table:Table, params:SQLInputValue[]): void {
    if (table === "book") logFormatError('Please use bookInsert')
    const columns = insertRows[table];
    const placeholders = Array(columns.length).fill('?').join(', ');
    db.prepare(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`).run(...params)
}

export function bookInsert (id:string, authors:string[], cover:string, title:string): void {
    db.exec('BEGIN')
    try {
        insert("book", [id, title, cover])
        for (const author of authors) {
            db.prepare(`INSERT OR IGNORE author (id, name) VALUES(?, ?)`).run(uuid(), author)
            db.prepare(`INSERT INTO book_author (book_id, author_id) SELECT ?, id FROM auther WHERE name = ?`)
                .run(id, author)
        }
        db.exec('COMMIT')
    } catch (e) {
        db.exec('ROLLBACK')
        throw new Error('Database operation failed')
    }
}