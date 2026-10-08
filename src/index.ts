import express from 'express';
import {initDb} from './modules/bd.js'
import {cleanExpiredSessions} from './modules/sessionUtils.js'
import {c, logFormatError, logFormatWarning, logFormatSuccess} from './modules/textFormatting.js'
import cors from 'cors';
import bookRouter from '../src/routes/bookRoute.js';

const banner:string =
`██████╗ ██████╗ ██████╗   ╔═════════╦═════════╗
╚════██╗██╔══██╗██╔══██╗  ║ ═══════ ║ ═══════ ║
 █████╔╝██████╔╝██████╔╝  ║ ═══════ ║ ═══════ ║
██╔═══╝ ██╔══██╗██╔══██╗  ║ ═══════ ║ ═══════ ║
███████╗██████╔╝██║  ██║  ║ ═══════ ║ ═══════ ║
╚══════╝╚═════╝ ╚═╝  ╚═╝  ╚═════════╩═════════╝`
const app = express()
const port = 2000
app.use(express.json())
app.use(cors({
    origin: "*",
    methods: ["GET", "HEAD", "OPTIONS", "POST","DELETE", "PATCH"],
}));
app.use('/book', bookRouter)


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