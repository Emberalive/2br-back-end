import fs from "node:fs";
import {type FuncResponse, QueryResult} from './types.js'
import {DatabaseSync, type SQLInputValue, SQLOutputValue} from 'node:sqlite';
import {logFormatError, logFormatProcess, logFormatSuccess, logFormatWarning} from './textFormatting.js'

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
    review: ['id', 'content', 'book_id', 'user_id'],
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

export function selectAll<T>(table:string):QueryResult<T> {
    try {
        const stmnt:string = `SELECT * FROM ${table}`;
        return {
            rows: db.prepare(stmnt).all() as T[],
            success: true,
        }
    } catch (e) {
        logFormatError(`[Server - selectOne] Query failed: ${e}`);
        return {
            success: false,
            message: "Failed db read"
        }
    }
}

export function selectAllWhere<T>(table:string, column:string, columnValue:string):QueryResult<T> {
    try {
        const stmnt:string = `SELECT * FROM "${table}" WHERE "${column}" = ?`;
        const rows = db.prepare(stmnt).all(columnValue) as T[]
        logFormatWarning(JSON.stringify(rows, null, 2));
        return {
            rows,
            success: true,
        }
    } catch (e) {
        logFormatError(`[Server - selectAllWhere] Query failed: ${e}`);
        return {
            success: false,
            message: "Failed db read"
        }
    }
}

export function selectReviews<T>(bookId:string):QueryResult<T> {
    try {
        const stmnt:string =
            `SELECT r.created_at, r.id, r.content, u.username 
             FROM review r
             JOIN user u ON u.id = r.user_id
             WHERE r.book_id = ?
             ORDER BY r.created_at DESC`;
        const rows = db.prepare(stmnt).all(bookId) as T[]
        logFormatWarning(JSON.stringify(rows, null, 2));
        return {
            rows,
            success: true,
        }
    } catch (e) {
        logFormatError(`[Server - selectAllWhere] Query failed: ${e}`);
        return {
            success: false,
            message: "Failed db read"
        }
    }
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
        SELECT bu.finished, bu.leant, bu.leant_to, b.id, b.title, b.cover, json_group_array(a.name) AS authors
        FROM book_user bu
        JOIN book_author ba ON ba.book_id = b.id
        JOIN author a ON a.id = ba.author_id
        JOIN book b on b.id = bu.book_id
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

export function bookInsert(bookId: string, authors: string[], cover: string, title: string, userId: string): FuncResponse {
    db.exec('BEGIN');
    try {
        db.prepare(`INSERT INTO book (id, title, cover) VALUES (?, ?, ?) ON CONFLICT DO NOTHING`)
            .run(bookId, title, cover);

        const link = db.prepare(`INSERT INTO book_user (book_id, user_id) VALUES (?, ?) ON CONFLICT DO NOTHING`)
            .run(bookId, userId);

        if (link.changes === 0) {
            db.exec('ROLLBACK');
            return { success: false, message: "Book already in library" };
        }

        const insertAuthor = db.prepare(`INSERT INTO author (name) VALUES (?) ON CONFLICT DO NOTHING`);
        const linkAuthor = db.prepare(`
            INSERT INTO book_author (book_id, author_id)
            SELECT ?, id FROM author WHERE name = ?
            ON CONFLICT DO NOTHING
        `);

        for (const author of authors) {
            insertAuthor.run(author);
            linkAuthor.run(bookId, author);
        }

        db.exec('COMMIT');
        return { success: true, message: "Successfully inserted into book" };
    } catch (err) {
        db.exec('ROLLBACK');
        logFormatError(`Database operation failed: ${err}`);
        return { success: false, message: "Could not insert book" };
    }
}