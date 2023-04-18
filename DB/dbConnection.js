import mongoose from "mongoose";

export const dbConnection = async () => {
    return await mongoose.connect(process.env.dbURL).then(() => {
        console.log('db connection successfully');
    }).catch((err) => {
        console.log("error while connecting to database");
    });
}

mongoose.set("strictQuery", true);