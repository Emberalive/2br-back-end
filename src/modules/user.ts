import {hashSync, compare} from 'bcrypt-ts'
import {insert} from "./db.js";
import type { User } from "./types.js";


export function hashPassword(password: string): string {
    return hashSync(password, 12);
}

export function checkPassword(password: string, hashedPassword: string):Promise<boolean> {
    return compare(password, hashedPassword);
}

export function createUser(user:User):boolean | string {
    const hash = hashPassword(user.password);
    const success = insert('user', [user.id, user.username, hash]);
    if (!success.success) {
        return success.message;
    }
    return true
}