const express = require("express");
const cors = require("cors");
const authRoutes = require('./auth');

const app = express();

app.use(express.json());
app.use(cors()); 

app.use('/auth', authRoutes)

app.listen(3000)