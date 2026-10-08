import {getSession} from './sessionUtils.js';
import type {Session} from './sessionUtils.js'
import type { Request, Response, NextFunction } from 'express';

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const authenticate = async (req:Request, res:Response, next:NextFunction) => {
    const sessionId: string | string[] | undefined = req.headers['x-session-id'];

    if (!sessionId) {
        return res.status(401).json({ success: false, error: 'No session provided' });
    }

    const session:Promise<Session | false> = getSession(sessionId);
    if (!session) {
        return res.status(401).json({ success: false, error: 'Invalid or expired session' });
    }


    /**
     * this below me will be gathered from the database not internal json storage
     */
    // const userData = await getUserById(session.userId);
    // if (!userData.success || !userData.user) {
    //     return res.status(401).json({ success: false, error: 'User not found' });
    // }

    // if (!userData.user.active) {
    //     return res.status(403).json({ success: false, error: 'Account suspended' });
    // }
    next();
};

// module.exports = { authenticate };