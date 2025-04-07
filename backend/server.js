const express = require("express");
const cors = require("cors");
const authRoutes = require('./auth');
const postsRoutes = require('./posts')
const search = require('./search')
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173",credentials: true})); 
app.use(cookieParser());

app.use('/auth', authRoutes)
app.use('/posts', postsRoutes)
app.use('/search', search)

app.listen(3000)