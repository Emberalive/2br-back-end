import {genSaltSync, hashSync, compare} from 'bcrypt-ts'
import { randomUUID as uuid } from 'node:crypto';
import {createSession} from '../modules/sessionUtils.js'
import {authenticate} from '../modules/sessionMiddleware.js'
import type { Request, Response } from 'express';
import express from 'express';
const router = express.Router();

type User = {
    id: string;
    username: string;
    password: string;
}
type UserFrontEnd = {
    id: string;
    username: string;
}
type UserLogin = {
    username: string;
    password: string;
}

function hashPassword(password: string): string {
    return hashSync(password, 12);
}

function checkPassword(password: string, hashedPassword: string):Promise<boolean> {
    return compare(password, hashedPassword);
}

function createUser(user:User):UserFrontEnd | boolean {
    const hash = hashPassword(user.password);
    /**
     * Add the user to the database
     * if it fails send why maybe username exists, blah, blah and blah
      */
    return {
        username: user.username,
        id: user.id,
    }
}

router.post('/login', authenticate, async (req:Request, res:Response) => {
    console.log("[Server POST - /login] STARTING")
    const user:UserLogin = req.body.user
    if(!user){
        return res.sendStatus(404)
    }
    const hash:string = "";
    const userId = ""
    /**
     * Get the password hash from the user
     * in their database and the userId
     */
    const validPass = await checkPassword(user.password, hash)
    if (!validPass){
        console.log("[Server - /login] password invalid")
        return res.status(401).send({success: false})
    }
    console.log(`[Server - /login] User: ${user.username}, has logged in`)
    return res.status(200).send({
        success: true,
        user: {
            userId: userId,
            username: user.username,
        },
    })
})

router.post('/register', authenticate, async (req:Request, res:Response) => {
    console.log("[Server POST - /register] STARTING")
    const userDetails:UserLogin = req.body;
    if (!userDetails.username || !userDetails.password){
        console.log("[Server - /register] no password or username sent")
        return res.status(400).send({success: false})
    }
    const user:UserFrontEnd | boolean = createUser({id: uuid(), password: userDetails.password, username: userDetails.username})

    let sessionId:string
    if (typeof user !== "boolean") {
        console.log("[Server - /register] REGISTERED user:", JSON.stringify(user));
        sessionId = createSession(user.id)
        return res.status(200).send({success: true, user: user, sessionId: sessionId})
    }
    console.log("[Server - /register] internal server error")
    return res.status(500).send({success: false})
})