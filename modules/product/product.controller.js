import { userModel } from "../../DB/models/user.model.js";
import { productModel } from "../../DB/models/product.model.js"
import cloudinary from "../../utils/cloudniry.js";


export const addProduct = async (req, res, next) => {
    try {
        const { title, description, price, createdBy } = req.body
        const product = new productModel({ title, description, price, createdBy: req.user.id })
        const savedProduct = await product.save()
        if (savedProduct) {
            await userModel.updateOne({ _id: req.user.id }, {
                $push: {
                    products: savedProduct._id
                }
            })
            res.json({ msg: "success", product })
        } else {
            res.json({ msg: "not done" })
        }

    } catch (error) {
        console.log(error);
        res.json({ msg: "error", error });
    }
}

export const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params
        // const idUser  = req.user.id
        const { title, description, price } = req.body
        const product = await productModel.findById(id)
        if (product) {
            if (product.createdBy == idUser) {
                const updatedProduct = await productModel.updateOne({ _id: id, createdBy: req.user.id },
                    { title, description, price })
                res.json({ msg: "success", updatedProduct })
                // res.json({ msg: " access" })
            } else {
                res.json({ msg: "ou are not the owner" })
            }
        } else {
            res.json({ msg: "product not found" })
        }
    } catch (error) {
        console.log(error);
        res.json({ msg: "error", error });
    }
}

export const deleteProduct = async (req, res, next) => {
    const { id } = req.params
    try {
        const product = await productModel.findById(id)
        console.log(product);
        if (product) {
            if (product.createdBy.toString() == req.user.id.toString()) {
                await productModel.findByIdAndDelete(id)
                res.json({ msg: "success", product })
            } else {
                res.json({ msg: "invalid id" })
            }
        } else {
            res.json({ msg: "product not found" })

        }
    } catch (error) {
        console.log(error);
        res.json({ msg: "error", error })
    }
}

// export const allProduct = async (req, res, next) => {
//     try {
//         // const { title, description, price, createdBy } = req.body
//         const products = await productModel.find({}).populate([{
//             path:'createdBy',
//             model:userModel,
//             select:'name email'
//         }]).select('title description')
//         if (products.length > 0) {
//             res.json({ msg: "success", products })
//         } else {
//             res.json({ msg: "not done" })
//         }
//     } catch (error) {
//         res.json({ msg: "error", error });
//     }
// }

export const allProduct = async (req, res, next) => {
    try {
        const user = await userModel.findById(req.user.id)
        const products = await productModel.aggregate([{
            $lookup: {
                from: 'users',
                localField: 'createdBy',
                foreignField: '_id',
                as: "data",
                pipeline: [{
                    $match: {
                        _id: user._id
                    }
                }]
            }
        }])
        if (products.length > 0) {
            res.json({ msg: "success", products })
        } else {
            res.json({ msg: "not done" })
        }
    } catch (error) {
        console.log(error);
        res.json({ msg: "error", error });
    }
}

export const profilePic = async (req, res, next) => {
    if (!req.file) {
       return next(new Error("plz enter your pic", { cause: 400 }))
    }
    // const imgUrl = req.file.destination + '/' + req.file.filename;
    const {secure_url} = await cloudinary.uploader.upload(req.file.path,{
        folder:`user/${req.user.id}`
    });
    // console.log(imgUrl);
    // const user = await userModel.findByIdAndUpdate({ _id: req.user.id }, { profilePic: imgUrl }, { new: true })
    const user = await userModel.findByIdAndUpdate({ _id: req.user.id }, { profilePic: secure_url }, { new: true })
    user ? res.json({ msg: "done" }) : next(new Error("not done", { cause: 400 }))
}
export const coverPic = async (req, res, next) => {
    if (!req.files.length) {
       return next(new Error("plz enter your cover pic", { cause: 400 }))
    }
    const imgUrls = [];
    for (const file of req.files) {
        imgUrls.push(file.destination+'/'+file.filename)
    }
    const user = await userModel.findByIdAndUpdate({ _id: req.user.id }, { cover: imgUrls }, { new: true })
    user ? res.json({ msg: "done" ,user}) : next(new Error("not done", { cause: 400 }))
}
