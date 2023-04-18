import { Router } from "express";
import { auth } from "../../middleware/auth/auth.js";
import { HME, multerValidation, myMulter } from "../../utils/multer.js";
import { myMulterCloud } from "../../utils/multerCloud.js";
import * as productRoutes from "./product.controller.js"
const router = Router()

router.post('/addProduct', auth(), productRoutes.addProduct)
router.put('/updateProduct/:id', auth(), productRoutes.updateProduct)
router.delete('/deleteProduct/:id', auth(), productRoutes.deleteProduct)
router.get('/allProduct', auth(), productRoutes.allProduct)

router.patch('/picture', auth(),
    myMulterCloud(multerValidation.image).single('image'), HME, productRoutes.profilePic)
router.patch('/cover', auth(),
    myMulter('user/cover', multerValidation.image).array('image', 5), HME, productRoutes.coverPic)

export default router