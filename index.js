import express from 'express';
import { dbConnection } from './DB/dbConnection.js';
const app = express();
import { config } from 'dotenv';
config()
const PORT = process.env.PORT || 3001
import * as allRoutes from './modules/index.routes.js'
// import { stackErr } from './utils/handleError.js';
// const baseUrl = '/api/v1'

app.use(express.json())
app.use('/upload', express.static('./upload'))

app.use('/users', allRoutes.userRoutes)
app.use('/products', allRoutes.productRoutes)
app.use('/messages', allRoutes.messageRoutes)
app.use('/books', allRoutes.bookRoutes)

// app.use((err, req, res, next) => {
//     if (err) {
//         res.status(err['cause'] || 500).json({
//             msg: "catch error",
//             error: err.message ,
//             stack: err.stack,
//             stackErr: stackErr
//         })
//     }
// })
dbConnection()
app.listen(PORT, () => {
    console.log(`Express server listening on ${PORT}`);
});

