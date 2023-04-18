import moment from "moment/moment.js"
import { bookModel } from "../../DB/models/book.model.js";
import { asyncHandler } from "../../utils/handleError.js";

///////////////////add book////////////////////////////////
export const addBook = asyncHandler(async (req, res, next) => {
    const { title } = req.body
    const exist = await bookModel.findOne({ title })
    if (exist) return next(new Error("Book founded"), { cause: 400 });
    const book = new bookModel({ title })
    const savedBook = await book.save()
    savedBook ? res.status(200).json({ msg: "success", savedBook }) : next(new Error("fail"), { cause: 400 });

})


///////////////////to issued book////////////////////////////////
export const issuedBook = async (req, res, next) => {
    const { bookId, issuedUser } = req.body;
    // const { bookId } = req.params;
    const returnDate = moment(req.body.returnDate).format("MM/DD/YYYY");
    const dateIssued = moment().format("MM/DD/YYYY");
    const issuedBook = await bookModel.findOneAndUpdate(
        { _id: bookId, issued: false }, { issued: true, dateIssued, dateReturned: returnDate, issuedUser }, { new: true });
    if (issuedBook) {
        res.json({ message: "Book already issued ", issuedBook })
    } else {
        next(Error("Book issue fail ", { cause: 400 }));
    }
}


///////////////////search book by title////////////////////////////////
export const searchBook = asyncHandler(async (req, res, next) => {
    const { title } = req.body
    const exist = await bookModel.findOne({ title })
    if (!exist) return next(new Error("Book founded"), { cause: 400 });
    book ? res.status(200).json({ msg: "success", book }) : next(new Error("fail"), { cause: 400 });

})


///////////////////get all book////////////////////////////////
export const allBook = asyncHandler(async (req, res, next) => {
    const books = await bookModel.find({})
    if (!books) return next(new Error("no books found"), { cause: 400 });
    res.status(200).json({ msg: "success", books })
});


///////////////////get all issued book////////////////////////////////
export const allIssuedBook = asyncHandler(async (req, res, next) => {
    const books = await bookModel.find({ issued: true })
    if (!books) return next(new Error("no books found"), { cause: 400 });
    res.status(200).json({ msg: "success", books })
});


///////////////////get all not issued book////////////////////////////////
export const allNotIssuedBook = asyncHandler(async (req, res, next) => {
    const books = await bookModel.find({ issued: false ,issuedUser:null})
    if (!books) return next(new Error("no books found"), { cause: 400 });
    res.status(200).json({ msg: "success", books })
});


///////////////////get  book issued with user////////////////////////////////
export const IssuedBookUser = asyncHandler(async (req, res, next) => {
    const idUser = req.user.id
    const books = await bookModel.find({ issued: true, issuedUser: idUser })
    if (!books) return next(new Error("no books found"), { cause: 400 });
    res.status(200).json({ msg: "success", books })
});


///////////////////all book not returned////////////////////////////////
export const allNotReturnedBook = asyncHandler(async (req, res, next) => {
    // const { id } = req.body
    const books = await bookModel.find({ issued: true })
    const nowData = moment()
    let fineDelay;
    for (const i in books) {
        books[i].fine = 20
        fineDelay = nowData.diff(books[i].dateReturned, 'days') * books[i].fine
        if (fineDelay < 0) {
            fineDelay = 0;
        }
        books[i].fine = fineDelay
        // books[i] = { fineDelay, ...books[i] };
    }
    res.json({ message: "Done !", books })

});


/////////////////////returned book////////////////////////////////
export const ReturnedBook = asyncHandler(async (req, res, next) => {
    const { bookId, issuedUser } = req.body
    const book = await bookModel.findOne({ issued: true, _id: bookId, issuedUser })
    const nowData = moment();
    book.fine = 20
    let dayDelay = nowData.diff(book.dateReturned, 'days');
    book.dayDelay = dayDelay;
    book.fine = dayDelay * book.fine
    // console.log(book);
    const returned = await bookModel.findOneAndUpdate({ issued: true, _id: bookId, issuedUser },
        { issued: false, dateIssued: null, dateReturned: null, issuedUser: null, },{new: true})
    if (!returned) return next(new Error("no book returned"), { cause: 400 });
    res.status(200).json({ msg: "returned", book })
});


// =================================================================
// export const deleteBookPicFn = async (req, res, next) => {
//     const { bookId,key } = req.params;
//     if (!(key == process.env.ADD_BOOK_KEY)) {
//         return next(Error("Key isn't correct !", { cause: 401 }));
//     }
//     const bookCheck = await bookModel.findById(bookId);
//     if (!bookCheck.bookPicture) {
//         return next(Error("There's no book picture !", { cause: 401 }));
//     }
//     fs.unlink(bookCheck.bookPicture, (err) => {
//         if (err) {
//             return next(Error(`Error with removing old picture: ${err}`, { cause: 400 }));
//         }
//     })
//     const bookUpdate = await bookModel.findByIdAndUpdate(bookId, { bookPicture: null }, { new: true });
//     if (!bookUpdate) {
//         return next(Error("Book not found !", { cause: 401 }));
//     }
//     res.json({ message: "Book Picture Deleted Successfully !", file: req.file });
// }


// export const uploadBookPicCloudFn = async (req, res, next) => {
//     const { bookId,key } = req.params;
//     if (!(key == process.env.ADD_BOOK_KEY)) {
//         return next(Error("Key isn't correct !", { cause: 401 }));
//     }
//     const bookCheck = await bookModel.findById(bookId);
//     const { customPath = 'profilePic' } = req.body;
// // it would be less buggy if we 1- delete according to public_id if exists
// // and whatever the result we put null to profilePictureCloudId and profilePicture
// // then we add the new pic on clean path, instead of replace by public_id
//     if (req.file) {
//         let image={};
//         if(bookCheck.bookPictureCloudId){
//             image = await cloudinary.uploader.upload(req.file.path, {
//                 folder: ``,
//                 public_id:bookCheck.bookPictureCloudId
//             })
//         }else{
//             image = await cloudinary.uploader.upload(req.file.path, {
//                 folder: `uploads/${bookCheck._id}/${customPath}`
//             })
//         }
//         const { secure_url, public_id } = image;
//         const bookUpdate = await bookModel.findByIdAndUpdate(bookId, { bookPicture: secure_url, bookPictureCloudId: public_id }, { new: true });
//         if (!bookUpdate) {
//             return next(Error("Book not found !", { cause: 401 }));
//         }
//         return res.json({ message: "Book Picture Uploaded Successfully !", file: req.file });
//     }
//     next(Error("Book Picture Uploaded FAILLL !", { cause: 500 }));
// }

// export const deleteBookPicCloudFn = async (req, res, next) => {
//     const { bookId,key } = req.params;
//     if (!(key == process.env.ADD_BOOK_KEY)) {
//         return next(Error("Key isn't correct !", { cause: 401 }));
//     }
//     const bookCheck = await bookModel.findById(bookId);
//     if (!bookCheck.bookPictureCloudId) {
//         return next(Error("There's no book picture !", { cause: 401 }));
//     }
//     const deleted = await cloudinary.uploader.destroy(bookCheck.bookPictureCloudId)
//     if(deleted.result != 'ok'){
//         return next(Error("Error Deleting book Picture !", { cause: 401 }));
//     }
//     const bookUpdate = await bookModel.findByIdAndUpdate(bookId, { bookPicture: null, bookPictureCloudId: null }, { new: true });
//     if (!bookUpdate) {
//         return next(Error("Book not found !", { cause: 401 }));
//     }
//     res.json({ message: "Book Picture Deleted Successfully !", file: req.file });

// }