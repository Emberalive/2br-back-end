import express from "express";
import {bookInsert, selectAllBooks, selectAllUserBooks} from '../modules/db.js'
import {logFormatWarning, logFormatProcess, logFormatSuccess, logFormatError} from '../modules/textFormatting.js'
import {authenticate} from '../modules/sessionMiddleware.js'
import {getSession} from '../modules/sessionUtils.js'
import type { Request, Response } from 'express';
import {bookInfo} from "../modules/books.js"

const router = express.Router();
router.use(authenticate)

router.post('/', async (req: Request, res: Response) => {
    console.log('[Server POST - /book] STARTING')
    const param = req.body.param;
    if (!param) {
        logFormatError('[Server - /book] No parameter sent');
        return res.status(400).send({message: "Invalid parameter", success:false});
    }
    if (typeof param !== 'number' && typeof param !== 'string') {
        logFormatError(`[Server - /book] invalid parameter type: ${JSON.stringify(param)}`);
        return res.status(400).json({ message: 'value must be a number or string', success: false });
    }
    logFormatSuccess('[Server - /book] parameters are valid')
    const data = await bookInfo(param)
    if (!data) {
        logFormatWarning('[Server - /addBook] No book data returned')
        return res.status(400).send({
            success: false,
            message:"Invalid book info"
        });
    }
    logFormatProcess(`[Server - /book] Book:\n${JSON.stringify(data, null, 2)}`);
    if (!data) {
        return res.status(404).send({
            success: false,
            message: "no Book found"
        });
    }

    const sessionObject = await getSession(req.headers['x-session-id'])
    //only need to verify session exists so TypeScript knows it's not false
    if (!sessionObject) {
        return res.status(401).send({
            success: false,
            error: 'No session provided'
        });
    }

    const response = bookInsert(data.id, data.author, data.cover, data.title, sessionObject.userId)
    if (!response.success) res.status(500).send(response)
    return res.status(201).send({
        book: data,
        success: true,
    })
})

router.get('/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!id) {
        console.log('[Server GET - /book/:id] ID is missing')
        return res.status(400).send({
            error: 'ID is missing',
            success: false,
        });
    }
    if (typeof id !== "string") {
        return res.status(400).send({
            error: 'id must be a string',
            success: false
        });
    }
    return res.status(501).send({
        error: 'Not implemented',
        success: false,
    });
})

router.get('/getall', async (req: Request, res: Response) => {
    const books = selectAllBooks()
    logFormatProcess(`[Server - /book] Getall: ${JSON.stringify(books, null, 2)}`)
    return res.status(200).send({
        success: true,
        books: books,
    })
})

router.get('/getall/user', async (req: Request, res: Response) => {
    const sessionObject = await getSession(req.headers['x-session-id'])
    if (!sessionObject) {
        return res.status(401).send({
            success: false,
        })
    }
    const books = selectAllUserBooks(sessionObject.userId)
    logFormatProcess(`[Server - /book] Getall: ${JSON.stringify(books, null, 2)}`)
    return res.status(200).json({
        success: true,
        books: books.map(r => ({
            ...r,
            finished: Boolean(r.finished),
            leant: Boolean(r.leant),
        })),
    });
})

router.patch('/', async (req: Request, res: Response) => {
    return res.status(500).send({
        success: false,
        message: "endpoint not implemented"
    })
})

export default router;