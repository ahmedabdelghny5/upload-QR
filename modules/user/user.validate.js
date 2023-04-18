import joi from 'joi'



export const SignUpValidation = {
    body: joi.object().required().keys({
        name: joi.string().min(3).max(20).required(),
        email: joi.string().email({ tlds: { allow: ['com', 'net'] } }).required(),
        mobile: joi.number(),
        password: joi.string().required().min(4).max(12),
        rePassword: joi.string().valid(joi.ref('password'))
    })
}