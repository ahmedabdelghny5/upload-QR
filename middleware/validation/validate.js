
const method = ['body', 'params', 'headers', 'query']


export const validate = (schema) => {
    return (req, res, next) => {
        let arrErrors = []
        method.map((key) => {
            if (schema[key]) {
                let { error } = schema[key].validate(req[key], { abortEarly: false })
                if (error?.details) {
                    error.details.map((error) => {
                        arrErrors.push(error.message)
                    })
                    // arrErrors.push(error.details)
                }
            }
        })
        if (arrErrors.length > 0) {
            //  next(new Error(arrErrors,{cause:500}))
            res.json({arrErrors:arrErrors,msg:"validation error"})
        } else {
            next()
        }
    }
}