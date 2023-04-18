import mongoose from "mongoose";


const messageSchema= mongoose.Schema({

    message:{
        type:String,
        require:true
    },
    sendTo:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    }
},{
    timestamps: true
})
const messageModel= mongoose.model('message', messageSchema)
export default messageModel