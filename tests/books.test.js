import { test } from 'node:test';
import assert from 'node:assert';

const BASE_URL = 'http://localhost:2000/book';

test('POST /book returns 201 and a book object', async (t) => {
    const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            param: 'The Hobbit'
        })
    });
    const data = await res.json();
    const book = data.book

    await t.test('returns 201', () => {
        assert.strictEqual(res.status, 201);
    });
    await t.test('title is a string', () => {
        assert.strictEqual(typeof book.title, 'string');
    });
    await t.test('author is an array', () => {
        assert.strictEqual(Array.isArray(book.author), true)
    })
    await t.test('cover is a string', () => {
        assert.strictEqual(typeof book.cover, 'string');
    });
    await t.test('id is a string', () => {
        assert.strictEqual(typeof book.id, 'string');
    });
})