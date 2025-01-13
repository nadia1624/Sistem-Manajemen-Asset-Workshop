const express = require("express");
// const route = require('./routes/index')
const bodyParser = require('body-parser')
require('dotenv/config')


const PORT = process.env.PORT;
const app = express();

app.use(express.json())
// app.use(route)

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
})