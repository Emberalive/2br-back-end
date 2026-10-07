import express from "express";
import type { Request, Response } from 'express';

import {bookInfo} from "../modules/books.js"

const router = express.Router();

router.get('/bookInfo', async (req: Request, res: Response) => {
    const param = req.body;
    if (!param) return res.status(400).send("Invalid parameter");
    const data = await bookInfo(param)
    /**
     * Need to add it to the database and
     * check it's been added before returning
     */
    return res.status(200).send({
        data: data
    })
})