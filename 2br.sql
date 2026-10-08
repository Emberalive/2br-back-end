create table if not exists user (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

create table if not exists book (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    cover TEXT
);

create table if not exists author (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

create table if not exists book_author (
    book_id TEXT NOT NULL REFERENCES book(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL REFERENCES author(id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, author_id)
);