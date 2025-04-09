const express = require("express");
const cors = require("cors");
const authRoutes = require('./auth');
const postsRoutes = require('./posts')
const search = require('./search')
const home = require('./home')
const cookieParser = require("cookie-parser");
const path = require('path');

const app = express();

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173",credentials: true})); 
app.use(cookieParser());

app.use('/auth', authRoutes)
app.use('/posts', postsRoutes)
app.use('/search', search)
app.use('/home', home)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.listen(3000)