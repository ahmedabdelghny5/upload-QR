import { userModel } from "../../DB/models/user.model.js"
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import { asyncHandler } from "../../utils/handleError.js"
import { emailFunction } from "../../utils/sendEmail.js"
import { nanoid } from "nanoid"
import moment from "moment/moment.js"
import { qrCodeFun } from "../../utils/qrCode.js"
// import asyncHandler from 'express-async-handler'
// import QRCode from 'qrcode'


export const signUp = asyncHandler(async (req, res, next) => {
    const { name, email, password, repassword, age } = req.body
    if (password == repassword) {
        const hashPassword = bcrypt.hashSync(password, +process.env.SALT_ROUNDS)
        const newUser = new userModel({ name, email, password: hashPassword, repassword, age })
        const savedUser = await newUser.save()
        const token = jwt.sign({ email: savedUser.email }, process.env.TOKEN_SIGNATURE, { expiresIn: 60 })
        const rfToken = jwt.sign({ email: savedUser.email }, process.env.TOKEN_SIGNATURE)
        const link = `${req.protocol}://${req.headers.host}/users/confirmEmail/${token}`
        const rfLink = `${req.protocol}://${req.headers.host}/users/reFreshToken/${rfToken}`
        emailFunction(email, 'confirm email', `<a href='${link}'>confirm email</a><br>
        <a href='${rfLink}'>reFreshToken</a>`)
        savedUser ? res.json({ msg: "success", user: newUser }) : next(new Error("not done", { cause: 400 }))
    } else {
        next(new Error("error password", { cause: 400 }))
    }
})

export const reFreshToken = asyncHandler(async (req, res, next) => {
    const { token } = req.params
    if (!token) return next(new Error("invalid token", { cause: 400 }))
    const decoded = jwt.verify(token, process.env.TOKEN_SIGNATURE)
    if (!decoded) return next(new Error("invalid token", { cause: 400 }))
    const user = await userModel.findOne({ email: decoded.email })
    if (!user) return next(new Error("user not found or already confirmed", { cause: 401 }));
    if (user.confirmEmail) return next(new Error("already confirmed", { cause: 401 }));
    const decodedToken = jwt.sign({ email: user.email }, process.env.TOKEN_SIGNATURE)
    const link = `${req.protocol}://${req.headers.host}/users/confirmEmail/${decodedToken}`
    emailFunction(user.email, 'confirm email', `<a href='${link}'>confirm email</a>`)
    res.status(200).json({ msg: "success plz confirm your email" })
})









export const confirmEmail = asyncHandler(async (req, res, next) => {
    const { token } = req.params
    if (!token) return next(new Error("invalid token", { cause: 400 }))
    const decoded = jwt.verify(token, process.env.TOKEN_SIGNATURE)
    if (!decoded) return next(new Error("invalid token payload", { cause: 400 }))
    const user = await userModel.findOneAndUpdate({ email: decoded.email, confirmEmail: false },
        { confirmEmail: true }, { new: true })
    user ? res.status(200).json({ msg: "confirmed success" }) : next(new Error("invalid", { cause: 400 }))
})








export const forgetPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body
    const user = await userModel.findOne({ email })
    if (!user) return next(new Error("user not found", { cause: 400 }))
    const code = nanoid()
    const token = jwt.sign({ email: user.email, id: user._id }, process.env.TOKEN_SIGNATURE)
    const link = `${req.protocol}://${req.headers.host}/users/resetPassword/${token}`
    emailFunction(email, 'verify password', `<a href='${link}'>verify password</a> <br>your code:${code}`)
    const sendCode = await userModel.findOneAndUpdate({ email }, { code }, { new: true })
    sendCode ? res.status(200).json({ msg: " success", code, link }) : next(new Error("fail", { cause: 400 }))

})







export const resetPassword = asyncHandler(async (req, res, next) => {
    const { token } = req.params
    const { code, newPassword } = req.body
    if (!token) {
        return next(new Error("invalid token", { cause: 400 }))
    } else {
        const decoded = jwt.verify(token, process.env.TOKEN_SIGNATURE)
        if (!decoded) {
            return next(new Error("invalid token", { cause: 400 }))
        } else {
            const user = await userModel.findById({ _id: decoded.id })
            // console.log(user);
            if (!user) return next(new Error("user not found", { cause: 400 }))
            const match = bcrypt.compareSync(newPassword, user.password)
            if (!match) {
                res.status(400).json({ msg: "password match old password" })
            } else {
                if (code == '') {
                    return next(new Error("invalid code", { cause: 400 }))
                }
                const hashPassword = bcrypt.hashSync(newPassword, +process.env.SALT_ROUNDS)
                const updated = await userModel.updateOne({ code }, { password: hashPassword, code: "" })
                updated.modifiedCount ? res.status(200).json({ msg: "success" }) : res.status(400).json({ msg: "wrong code" })
            }
        }
    }
});

export const signIn = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body
    const user = await userModel.findOne({ email })
    if (user) {
        if (!user?.confirmEmail) return next(new Error("confirm email first", { cause: 400 }))
        const match = await bcrypt.compare(password, user.password)
        if (match) {
            const token = jwt.sign({ email: user.email, id: user._id }, process.env.TOKEN_SIGNATURE)
            await userModel.updateOne({ email }, { isOnline: true, isLoggedIn: true })
            res.json({ msg: "success", token })
        } else {
            res.json({ msg: "incorrect password" })
        }
    } else {
        res.json({ msg: "user not found" });
    }

})

export const signOut = asyncHandler(async (req, res, next) => {
    const { email } = req.body
    const user = await userModel.findOneAndUpdate({ email, isOnline: true, isLoggedIn: true }, {
        isLoggedIn: false, lastSeen: moment().format()
    })
    !user ? next(new Error(" email not found", { cause: 400 })) : res.json({ msg: "sign out" })
})

export const gatAllUsers = async (req, res, next) => {
    const { name, age } = req.query
    // const users = await userModel.find({$and:[{ name: { $regex: `sara` } }, { age: { $lt: 29 } }]})
    // const users = await userModel.find({ name: { $regex: `^${name}` } , age: { $lt: age } })
    const users = await userModel.find({ name: new RegExp('^' + name + '$'), age: { $lt: age } })
    if (users.length === 0) {
        res.json('users not found')
    } else {
        res.json(users)
    }
}

export const deleteUser = async (req, res, next) => {
    const user = await userModel.findByIdAndDelete({ _id: req.user.id })
    if (user) {
        res.json({ msg: "success", user })
    } else {
        res.json('users not found')
    }
}

export const shareQrCode = async (req, res, next) => {
    const { id } = req.params
    const link = `${req.protocol}://${req.headers.host}/users/profile/${id}`
    const qrCode = await qrCodeFun({ data: link })
    // QRCode.toDataURL(link, function (err, url) {
    //    res.json({ qrCode: url})
    //   })
    res.json( qrCode )

}

export const getProfileLink = async (req, res, next) => {
    const { id } = req.params
    const user = await userModel.findById({ _id: id }).select('name email profilePic')
    if (user) {
        res.json(user)
    } else {
        next(new Error('user not found'), { cause: 400 })
    }
}

export const updateUser = async (req, res, next) => {
    const { name, password, newPassword } = req.body
    const user = await userModel.findById(req.user.id)
    if (!user) {
        res.json({ msg: "user not found" })
    }
    const match = bcrypt.compareSync(password, user.password)
    if (match) {
        const hashPassword = bcrypt.hashSync(newPassword, 4)
        const newUser = await userModel.findByIdAndUpdate({ _id: req.user.id }, { name, password: hashPassword }, { new: true })
        res.json({ msg: "success", newUser })
    } else {
        res.json('error in password')
    }

}

