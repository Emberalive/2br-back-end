import {genSaltSync, hashSync, compare} from 'bcrypt-ts'
import {authenticate} from '../modules/sessionMiddleware.js'
import type { Request, Response } from 'express';
import express from 'express';

const router = express.Router();

type User = {
    id: string;
    username: string;
    password: string;
}
type UserLogin = {
    username: string;
    password: string;
}

function hashPassword(password: string): string {
    return hashSync(password, 12);
}

function checkPassword(password: string, hashedPassword: string) {
    return compare(password, hashedPassword);
}

function createUser(user:User) {

}

router.post('login/', authenticate, async (req:Request, res:Response) => {
    const user:UserLogin = req.body.user
    if(!user){
        return res.sendStatus(404)
    }
    const hash:string = "";
    /**
     * Get the password hash from the user
     * in their database
     */
    const validPass = checkPassword(user.password, hash)
})