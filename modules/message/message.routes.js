import { Router } from "express";
import * as messageRoutes from "./message.controller.js"
const router=Router()

router.post('/sendMessage',messageRoutes.sendMessage)



export default router