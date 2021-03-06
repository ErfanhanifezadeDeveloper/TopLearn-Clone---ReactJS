require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const cors = require('cors');
const userApi = require('./Routes/User');
const courseApi = require('./Routes/Course');

const App = express();
const PORT = process.env.PORT || 4000;

//MidleWares
App.use(bodyparser.json());
App.use(cors());

//Data Base
mongoose.connect(
    process.env.DB,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
    ()=>{ console.log('Connecting DataBase Successfully!') }
);

App.get('/' , (req , res) =>{
    res.send('welcome to danaco test api');
});

//Routes Middlewares
App.use('/api/user' , userApi);
App.use('/api/course' , courseApi);

App.listen(PORT , ()=>{ console.log(`Server start on port: ${PORT}`) });