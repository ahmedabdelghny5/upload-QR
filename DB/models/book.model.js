import mongoose from "mongoose";


const bookSchema = mongoose.Schema({
    title: String,
    issuedUser: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    issued:{type:Boolean,default:false},
    dateIssued:{type:String,default:null},
    dateReturned:{type:String,default:null},
    dayDelay:Number,
    fine:{type:Number,default:0}
})

export const bookModel = mongoose.model('book', bookSchema)
