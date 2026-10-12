import express from "express";
import {bookInsert, selectAll, selectAllBooks} from '../modules/db.js'
import {logFormatWarning, logFormatProcess, logFormatSuccess, logFormatError} from '../modules/textFormatting.js'
import {authenticate} from '../modules/sessionMiddleware.js'
import type { Request, Response } from 'express';

import {bookInfo} from "../modules/books.js"

const router = express.Router();
router.use(authenticate)

router.post('/', async (req: Request, res: Response) => {
    console.log('[Server POST - /book] STARTING')
    const param = req.body.param;
    if (!param) {
        logFormatError('[Server - /book] No parameter sent');
        return res.status(400).send("Invalid parameter");
    }
    if (typeof param !== 'number' && typeof param !== 'string') {
        logFormatError(`[Server - /book] invalid parameter type: ${JSON.stringify(param)}`);
        return res.status(400).json({ error: 'value must be a number or string' });
    }
    logFormatSuccess('[Server - /book] parameters are valid')
    const data = await bookInfo(param)
    if (!data) {
        logFormatWarning('[Server - /addBook] No book data returned')
        return res.status(400).send("Invalid book info");
    }
    logFormatProcess(`[Server - /book] Book:\n${JSON.stringify(data, null, 2)}`);
    if (!data) {
        return res.status(404).send("no Book found");
    }
    bookInsert(data.id, data.author, data.cover, data.title)
    return res.status(201).send({
        book: data,
        success: true,
    })
})

router.get('/getall', async (req: Request, res: Response) => {
    const books = selectAllBooks()
    logFormatProcess(`[Server - /book] Getall: ${JSON.stringify(books, null, 2)}`)
    return res.status(200).send({
        success: true,
        books: books,
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
    /**
     * request from database
     * and return book object retrieved
     */
})

// router.get('/getAll/:userId', async (req: Request, res: Response) => {
//     const id = req.params.userId;
//     if (!id) {
//         console.log('[Server GET - /book/getAll/:userId] ID is missing')
//         return res.status(400).send({
//             error: 'ID is missing',
//             success: false,
//         })
//     }
//     if (typeof id !== "string") {
//         console.log('[Server GET - /book/getAll/:userId] ID is not a string')
//         return res.status(400).send({
//             error: 'id must be a string',
//             success: false
//         })
//     }
//     return res.status(501).send({
//         error: 'Not implemented',
//         success: false,
//     });
//     /**
//      * get all user's books from the database
//      * and return retrieved
//      */
// })

export default router;