import multer from "multer";


export const multerValidation = {
    image: ['image/png', 'image/jpeg'],
    pdf: ['application/pdf']
}

export const HME = (err, req, res, next) => {
    if (err) {
        res.status(400).json({ error: err })
    } else {
        next()
    }
}

export function myMulterCloud(customValidation) {
    if (!customValidation) {
        customValidation = customValidation.image
    }
    const storage = multer.diskStorage({})
    function fileFilter(req, file, cb) {
        if (customValidation.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb('invalid format', false)
        }
    }
    const upload = multer({ dest: "upload", fileFilter, storage })
    return upload
}

