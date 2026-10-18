import { randomUUID as uuid } from 'node:crypto';
import {createSession} from '../modules/sessionUtils.js'
import {checkPassword, createUser} from "../modules/user.js";
import type { Request, Response } from 'express';
import express from 'express';
import {User} from "../modules/types.js";
import selectOne from '../modules/db.js'
const router = express.Router();

type UserLogin = {
    username: string;
    password: string;
}

router.post('/login', async (req:Request, res:Response) => {
    console.log("[Server POST - /login] STARTING")
    const userLogin:UserLogin = req.body
    if(!userLogin){
        return res.sendStatus(404)
    }

    const user:User | undefined = selectOne('user', 'username', userLogin.username)

    if (!user) return res.status(401).send({success: false});

    const validPass = await checkPassword(userLogin.password, user.password)
    if (!validPass){
        console.log("[Server - /login] password invalid")
        return res.status(401).send({success: false})
    }

    console.log(`[Server - /login] User: ${userLogin.username}, has logged in`)
    return res.status(200).send({
        success: true,
        user: {
            userId: user.id,
            username: userLogin.username,
        },
        sessionId: createSession(user.id)
    })
})

router.post('/register', async (req:Request, res:Response) => {
    console.log("[Server POST - /register] STARTING")
    const userDetails:UserLogin = req.body;
    if (!userDetails.username || !userDetails.password){
        console.log("[Server - /register] no password or username sent")
        return res.status(400).send({success: false})
    }
    const user:User =  {id: uuid(), password: userDetails.password, username: userDetails.username}
    const created:string | boolean = createUser(user)

    if (created === true) {
        console.log("[Server - /register] REGISTERED user:", JSON.stringify(user));
        return res.status(200).send({success: true, user: user, sessionId: createSession(user.id)})
    }
    console.log("[Server - /register] internal server error")
    return res.status(500).send({success: false, message: created})
})

export default router;