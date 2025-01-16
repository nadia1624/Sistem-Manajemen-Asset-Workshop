const express = require("express");
const route = require('./routes/index')
const path = require('path');
const bodyParser = require('body-parser')
require('dotenv/config')

const penggunaRoutes = require('./routes/pengguna');

const PORT = process.env.PORT;
const app = express();

app.use(express.json())
app.use(route)
app.use(penggunaRoutes);

  
// Middleware untuk melayani file statis dari folder "public"
app.use(express.static(path.join(__dirname, 'public')));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
})