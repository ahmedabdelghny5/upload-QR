import mongoose from "mongoose";


const productSchema = mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
})

export const productModel = mongoose.model('product', productSchema)
