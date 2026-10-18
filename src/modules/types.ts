import {SQLOutputValue} from "node:sqlite";

export type Book = {
    id: string;
    author: string[];
    cover: string;
    title: string;
}

export type UserFrontEnd = {
    id: string;
    username: string;
}

export type FuncResponse = {
    success: boolean;
    message: string;
}

export type Review = {
    id: string;
    content: string;
    book_id: string;
    user_id: string;
}

export type Session = {
    sessionId: string;
    userId: string;
    createdAt: string;
    expiresAt: string;
}

export type User = {
    id: string;
    username: string;
    password: string;
}

export type queryResponse = {
    rows:Record<string,SQLOutputValue>[] | string;
    success: boolean;
}