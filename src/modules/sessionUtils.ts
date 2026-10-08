import * as fs from 'node:fs';
import { randomUUID as uuid } from 'node:crypto';

const SESSIONS_FILE = '/home/sammy/Development/2br-back-end/src/persistentData/sessions.json';
const SESSION_EXPIRY_HOURS = 24;

export type Session = {
    sessionId: string;
    userId: string;
    createdAt: string;
    expiresAt: string;
}

export const getSession = async (sessionId:string | string[]): Promise<Session | false> => {
    const sessions = readSessions();
    const session:Session | undefined = sessions.find(s => s.sessionId === sessionId);
    if (!session) return false;
    if (new Date(session.expiresAt) < new Date()) {
        deleteSession(sessionId);
        return false;
    }
    return session;
};

const readSessions = (): Session[] => {
    const data = fs.readFileSync(SESSIONS_FILE, 'utf-8');
    return JSON.parse(data).sessions;
};

const writeSessions = (sessions: Session[]): void => {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify({ sessions }, null, 2));
};

export const createSession = (userId:string):string => {
    const sessions = readSessions();

    const session:Session = {
        sessionId: uuid(),
        userId,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000).toISOString()
    };

    sessions.push(session);
    writeSessions(sessions);

    return session.sessionId;
};

const deleteSession = (sessionId:string | string[]) => {
    const filtered = readSessions().filter(s => s.sessionId !== sessionId);
    writeSessions(filtered);
};

export const cleanExpiredSessions = () => {
    console.log('[ Server - /cleanExpiredSessions] sessions expired are being cleaned')
    const sessions = readSessions();
    if (!sessions) return
    const now = new Date();
    const valid = sessions.filter(s => new Date(s.expiresAt) > now);
    writeSessions(valid);
};

// module.exports = { createSession, deleteSession, cleanExpiredSessions, getSession };