import express from 'express';
import * as fs from 'node:fs';
import {cleanExpiredSessions} from './modules/sessionUtils.js'
import cors = require('cors');
import sqlite3 = require('sqlite3');

const app = express()
const db = new sqlite3.Database('2br')

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
    console.log("Loading database from file")
    try {
        db.serialize(() => {
            db.run(fs.readFileSync('../2br.sql', 'utf8'))
        })
    } catch (e) {
        console.log("Database could not be loaded\n:", e)
    }
    console.log("Database has been loaded")
    console.log("Server has been started")
})