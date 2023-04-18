let stackErr;

const asyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch((err) => {
            if (err.code == 11000) {
                // return res.status(500).json({ msg: "user already exists" })
                next(new Error("user already exists",{cause:400}))
                stackErr=err.stack;
            }
            console.log(err);
            stackErr=err.stack;
            // res.status(500).json({ msg: "catch error", error: err.message, stack: err.stack })
            next(new Error("catch error",{cause:500}))
        })
    }
}

export {
    asyncHandler,
    stackErr
}
