import express from 'express';
import selectOne, {initDb} from './modules/db.js'
import type { Request, Response } from 'express';
import {cleanExpiredSessions, getSession} from './modules/sessionUtils.js'
import {c, logFormatError, logFormatSuccess} from './modules/textFormatting.js'
import cors from 'cors';
import bookRouter from '../src/routes/bookRoute.js';
import userRouter from '../src/routes/user.js'
import {authenticate} from "./modules/sessionMiddleware.js";

const banner:string =
`██████╗ ██████╗ ██████╗   ╔═════════╦═════════╗
╚════██╗██╔══██╗██╔══██╗  ║ ═══════ ║ ═══════ ║
 █████╔╝██████╔╝██████╔╝  ║ ═══════ ║ ═══════ ║
██╔═══╝ ██╔══██╗██╔══██╗  ║ ═══════ ║ ═══════ ║
███████╗██████╔╝██║  ██║  ║ ═══════ ║ ═══════ ║
╚══════╝╚═════╝ ╚═╝  ╚═╝  ╚═════════╩═════════╝`
const app = express()

app.use((req, res, next) => {
    logFormatSuccess(`[Server - HTTP request] ${req.method} ${req.url}`); next();
});

const port = 2000
app.use(express.json())
app.use(cors({
    origin: "*",
    methods: ["GET", "HEAD", "OPTIONS", "POST","DELETE", "PATCH"],
}));
app.use('/book', bookRouter)
app.use('/user', userRouter)

app.post('/authenticate', authenticate, async(req:Request, res:Response) => {
    const session = await getSession(req.headers['x-session-id'])
    if(session === false) return res.status(403).send('Not authorized')
    const user = selectOne('user', 'id', session.userId)
    return res.status(200).send({success: true, user: user})
})

app.listen(port, (err?:Error) => {
    if (err) {
        logFormatError(`Failed to start on port ${port}:`)
        process.exit(1);
    }
    console.log(`${c.blue}${banner}${c.reset}`)
    console.log("Starting 2br...")
    console.log(`API Listening on port: ${c.blue}${port}${c.reset}`)
    initDb()
    logFormatSuccess("Server has been started")
    //clean all expired sessions on start up
    cleanExpiredSessions()
    // run every hour to clean expired sessions and ghost devices
    setInterval(cleanExpiredSessions, 60 * 60 * 1000);
})