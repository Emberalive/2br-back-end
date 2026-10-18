import express from "express";
import {authenticate} from '../modules/sessionMiddleware.js'

const router = express.Router();
router.use(authenticate)











export default router;