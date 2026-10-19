create table if not exists user (
    id TEXT NOT NULL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

create table if not exists book (
    id TEXT NOT NULL PRIMARY KEY,
    title TEXT NOT NULL,
    cover TEXT
);

create table if not exists book_user (
    book_id TEXT NOT NULL REFERENCES book(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
--     meta-data for users has not been implemented yet
    finished BOOLEAN NOT NULL DEFAULT false,
    leant BOOLEAN NOT NULL DEFAULT false,
    leant_to TEXT,
    PRIMARY KEY (book_id, user_id)
);

create table if not exists review (
    id TEXT NOT NULL PRIMARY KEY,
    content TEXT NOT NULL,
    book_id TEXT NOT NULL REFERENCES book(id),
    user_id TEXT NOT NULL REFERENCES user(id),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

create table if not exists author (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

create table if not exists book_author (
    book_id INTEGAR NOT NULL REFERENCES book(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL REFERENCES author(id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, author_id)
);