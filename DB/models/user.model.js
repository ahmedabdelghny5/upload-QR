import mongoose from "mongoose";


const userSchema = mongoose.Schema({
    name:String,
    email:{type:String,unique:true},
    password:String,
    age:Number,
    products:[{
        type:mongoose.Types.ObjectId,
        ref:"product"
    }],
    isLoggedIn:{type:Boolean,default:false},
    isOnline:{type:Boolean,default:false},
    confirmEmail:{type:Boolean,default:false},
    lastSeen:{type:Date},
    isDeleted:{type:Boolean,default:false},
    code:{type:String,default:""},
    profilePic:String,
    cover:Array,
    role:{type:String,default:"User"}
},{
    timestamps:true
})

export const userModel = mongoose.model('User', userSchema)