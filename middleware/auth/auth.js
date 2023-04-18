import jwt from 'jsonwebtoken'
import { userModel } from '../../DB/models/user.model.js';

export const role = {
    Admin: "Admin",
    User: "User"
}

export const auth = (accessRoles = []) => {
    return async (req, res, next) => {
        try {
            const { auth } = req.headers;
            if (!auth) {
                return res.json({ message: "please inter token authentication" })
            }
            if (!auth.startsWith("ahmed__")) {
                return res.json({ message: "invalid token " })
            }
            const token = auth.split("ahmed__")[1];
            const decoded = jwt.verify(token, process.env.TOKEN_SIGNATURE)
            if (!decoded?.id) {
                return res.json({ message: "invalid token payload" })
            }
            const user = await userModel.findById(decoded.id)
            if (!accessRoles.includes(user.role)) {
                return res.json({ message: "you are not authorized" })
            }
            req.user = user
            next()
        } catch (error) {
            res.json({ message: "error", error })
            console.log(error);
        }
    }
}