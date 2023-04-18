
import { Router } from "express";
import { auth, role } from "../../middleware/auth/auth.js";
import { validate } from "../../middleware/validation/validate.js";
import * as userRouter from "./user.controller.js";
import { SignUpValidation } from "./user.validate.js";
import { endPoint } from "./userRole.js";

const router =Router()

router.post('/signup',validate(SignUpValidation),userRouter.signUp)
router.post('/signin',userRouter.signIn)
router.get('/gatAllUsers',userRouter.gatAllUsers)
router.get('/confirmEmail/:token',userRouter.confirmEmail)
router.get('/reFreshToken/:token',userRouter.reFreshToken)
router.patch('/forgetPassword',userRouter.forgetPassword)
router.patch('/resetPassword/:token',userRouter.resetPassword)
router.put('/signOut',userRouter.signOut)
router.delete('/deleteUser',auth(),userRouter.deleteUser)
router.get('/profile/:id',userRouter.getProfileLink)
router.get('/shareQrCode/:id',userRouter.shareQrCode)
router.put('/updateUser',auth([endPoint.getAdmins]),userRouter.updateUser)


export default router
