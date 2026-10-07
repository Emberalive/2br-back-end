import express from 'express';
import {cleanExpiredSessions} from './modules/sessionUtils.js'
const app = express()
const cors = require('cors')


const port = 2000
app.use(express.json())
app.use(cors({
    origin: "*",
    methods: ["GET", "HEAD", "OPTIONS", "POST","DELETE", "PATCH"],
}));


app.listen(port, async () => {
    console.log("Starting 2br...")
    console.log(`API Listening on port: ${port}`)

    //clean all expired sessions on start up
    cleanExpiredSessions()
// run every hour to clean expired sessions and ghost devices
    setInterval(cleanExpiredSessions, 60 * 60 * 1000);
})