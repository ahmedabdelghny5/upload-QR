import messageModel from "../../DB/models/message.model.js";
import { userModel } from "../../DB/models/user.model.js";



export const sendMessage = async (req, res, next) => {
    try {
        // const { userId, message } = req.body;
        const isExist = await userModel.findById(req.body.sendTo);
        if (isExist) {
            const message = new messageModel(req.body)
            const saveMessage = await message.save()
            saveMessage ? res.json({ msg: "success", saveMessage }) : res.json({ msg: "not done" });
        } else {
            res.json({ msg: "user does not exist" })
        }
    } catch (error) {
        res.json({ message: 'catch error', error });
    }
};