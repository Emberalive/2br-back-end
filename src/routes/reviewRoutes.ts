import express from "express";
import {authenticate} from '../modules/sessionMiddleware.js'
import {insert, selectAllWhere} from "../modules/db.js";
import type { Request, Response } from 'express';
import {type Review, type Session} from '../modules/types.js'
import {getSession} from "../modules/sessionUtils.js";
import { randomUUID as uuid } from 'node:crypto';

const router = express.Router();
router.use(authenticate)

router.post("/", async (req: Request, res: Response) => {
    const sessionObj:Session | false = await getSession(req.headers['x-session-id'])
    if (!sessionObj) {
        return res.status(400).send({
            success: false,
            message: "No review"
        });
    }
    let review: Review = {
        id: uuid(),
        content: req.body.content,
        book_id: req.body.book_id,
        user_id: sessionObj.userId,
    };
    const response = insert('review', [review.id, review.content, review.book_id, review.user_id])
    return res.status(200).send(response);
})

router.get('/:bookId', async (req: Request, res: Response) => {
    const bookId = req.params.bookId[0];
    if (!bookId) {
        return res.status(400).send({
            success: false,
            message: "No book Id sent"
        })
    }
    const response  = selectAllWhere('review', 'book_id', bookId)
    if (!response.success) {
        return res.status(500).send(response)
    }
    return res.status(200).send(response)
})







export default router;