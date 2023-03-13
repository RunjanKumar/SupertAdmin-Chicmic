require('dotenv').config();
const express = require('express');
const port = process.env.PORT || 2501;
const router = require('./router/route');
const userValidation = require('./validation/userValidation.js');

const app = express();
app.use(express.json()); 

app.use('/' , userValidation , router);


app.listen(port, (err) => {
    if (err) console.log(err.message);
    console.log(`server is started on port ${port}`);
 
});