import { randomUUID as uuid } from 'node:crypto';
import {type Book} from './types.js';

export async function bookInfo(param: number | string): Promise<Book | void> {
    let response: Response;
    const headers = {
        "User-Agent": '2br samueltsutcliffe@gmail.com'
    }
    if (typeof param ===  "number") {
        response = await fetch(`https://openlibrary.org/search.json?isbn=${encodeURIComponent(param)}`, {headers: headers})
    } else {
        response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(param)}`, {headers: headers})
    }
    if (!response.ok) return
    const data = await response.json();
    if (!data.docs[0]) return
    return {
        id: uuid(),
        title: typeof param === "string" ? param : data.dosc[0].title,
        author: data.docs[0].author_name,
        cover: `https://covers.openlibrary.org/b/id/${data.docs[0].cover_i}-M.jpg?default=false`,
    }
}