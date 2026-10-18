import fs from "node:fs";
import {type FuncResponse} from './types.js'
import {DatabaseSync, type SQLInputValue} from 'node:sqlite';
import {logFormatError, logFormatProcess, logFormatSuccess} from './textFormatting.js'

export const db = new DatabaseSync('2br.db');
db.exec('PRAGMA foreign_keys = ON');
/**
 * Key: This is the table your inserting into
 * Value: These are the entries for the table
 */
const insertRows: Record<string, string[]> = {
    book: ['id', 'title', 'cover'],
    user: ['id', 'username', 'password'],
    book_user: ['book_id', 'user_id'],
    review: ['id', 'content', 'book_id', 'user_id', 'created_at'],
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

export default function selectOne<T>(table:string, column:string, value:string): T | undefined {
    const stmnt: string = `SELECT * FROM ${table} WHERE ${column} = ?`;
    try {
        return db.prepare(stmnt).get(value) as T | undefined
    } catch (e) {
        logFormatError(`[Server - selectOne] Query failed: ${e}`);
    }
}

export function selectAll(table:string) {
    const stmnt:string = `SELECT * FROM ${table}`;
    return db.prepare(stmnt).all();
}

export function selectAllBooks() {
    const stmnt:string = `
        SELECT b.id, b.title, b.cover, json_group_array(a.name) AS authors
        FROM book b
        JOIN book_author ba ON ba.book_id = b.id
        JOIN author a ON a.id = ba.author_id
        GROUP BY b.id
    `;
    return db.prepare(stmnt).all().map((row: any) => ({
        ...row,
            authors: JSON.parse(row.authors),
    }));
}

export function selectAllUserBooks(userId:string) {
    const stmnt:string = `
        SELECT b.id, b.title, b.cover, json_group_array(a.name) AS authors
        FROM book b
        JOIN book_author ba ON ba.book_id = b.id
        JOIN author a ON a.id = ba.author_id
        WHERE user_id = ?
        GROUP BY b.id
    `;
    return db.prepare(stmnt).all(userId).map((row: any) => ({
        ...row,
        authors: JSON.parse(row.authors),
    }));
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

export function bookInsert (bookId:string, authors:string[], cover:string, title:string, userId:string): FuncResponse {
    db.exec('BEGIN')
    try {
        insert("book", [bookId, title, cover])
        insert("book_user", [bookId, userId])
        for (const author of authors) {
            db.prepare(`INSERT OR IGNORE INTO author (name) VALUES(?)`).run(author)
            db.prepare(`INSERT INTO book_author (book_id, author_id) SELECT ?, id FROM author WHERE name = ?`)
                .run(bookId, author)
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