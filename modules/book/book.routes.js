import { Router } from "express";
import { auth } from "../../middleware/auth/auth.js";
import * as bookController from "./book.controller.js"
const router = Router()

router.post('/addBook',bookController.addBook)
router.put('/issuedBook',bookController.issuedBook)
router.get('/allBook',bookController.allBook)
router.get('/searchBook',bookController.searchBook)
router.get('/allIssuedBook',bookController.allIssuedBook)
router.get('/allNotIssuedBook',bookController.allNotIssuedBook)
router.get('/allNotReturnedBook',bookController.allNotReturnedBook)
router.get('/IssuedBookUser',auth(),bookController.IssuedBookUser)
router.put('/ReturnedBook',bookController.ReturnedBook)

export default router