import { randomUUID as uuid } from 'node:crypto';
import {type Book} from './types.js';

const HEADERS = { 'User-Agent': '2br samueltsutcliffe@gmail.com' };
const FIELDS = 'title,author_name,isbn,cover_i';

async function searchBook(params: Record<string, string>, fallbackId?: string): Promise<Book | null> {
    const query = new URLSearchParams({ ...params, fields: FIELDS, limit: '1' });
    const response = await fetch(`https://openlibrary.org/search.json?${query}`, { headers: HEADERS });
    if (!response.ok) return null;

    const data = await response.json();
    const doc = data.docs?.[0];
    if (!doc) return null;

    const isbn: string | undefined = doc.isbn?.find((i: string) => i.length === 13);

    return {
        id: isbn ?? fallbackId ?? uuid(),
        title: doc.title,
        author: doc.author_name?? 'Unknown',
        cover: doc.cover_i
            ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg?default=false`
            : "",
    };
}

export function bookByTitle(title: string, author: string) {
    return searchBook({ q: `title:"${title}" author:"${author}"` });
}

export function bookByIsbn(isbn: string) {
    return searchBook({ isbn }, isbn);
}