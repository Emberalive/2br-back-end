import {getSession} from './sessionUtils.js';
import type {Session} from './types.js'
import type { Request, Response, NextFunction } from 'express';
import selectOne from "./db.js";
import {type User} from "./types.js";
import {logFormatError, logFormatSuccess, logFormatWarning} from "./textFormatting.js";

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const authenticate = async (req:Request, res:Response, next:NextFunction) => {
    const sessionId: string | string[] | undefined = req.headers['x-session-id'];

    if (!sessionId) {
        logFormatWarning('No session provided');
        return res.status(401).json({ success: false, error: 'No session provided' });
    }

    const session:Session | false = await getSession(sessionId);
    if (session === false) {
        logFormatWarning('Invalid or expired session');
        return res.status(401).json({ success: false, error: 'Invalid or expired session' });
    }

    const user:User | undefined = selectOne('user', 'id', session.userId)

    if (!user) {
        logFormatWarning('User not found');
        return res.status(401).json({success: false, error: 'user not found'});
    }
    logFormatSuccess('session authenticated')

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