import express from "express";
import {authenticate} from '../modules/sessionMiddleware.js'
import type { Request, Response } from 'express';

import {bookInfo} from "../modules/books.js"

const router = express.Router();
// router.use(authenticate)

router.post('/', async (req: Request, res: Response) => {
    console.log('[Server - /book] STARTING')
    const {param} = req.body;
    if (!param) {
        console.log('[Server - /book] No parameter sent');
        return res.status(400).send("Invalid parameter");
    }
    if (typeof param !== 'number' && typeof param !== 'string') {
        console.log(`[Server - /book] invalid parameter type: ${param}`);
        return res.status(400).json({ error: 'value must be a number or string' });
    }
    console.log('[Server - /book] parameters are valid')
    const data = await bookInfo(param)
    if (!data) {
        console.log('[Server - /addBook] No book data returned')
        return res.status(400).send("Invalid book info");
    }
    console.log(`[Server - /book] Book:\n${JSON.stringify(data, null, 2)}`);
    /**
     * Need to add it to the database and
     * check it's been added before returning
     */
    return res.status(201).send(data)
})

export default router;