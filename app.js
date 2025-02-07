const express = require("express");
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');  
const route = require('./routes/index')
const profileMiddleware = require('./middleware/profilMiddleware')
// const User = require('./models/user')
// const Kategori = require('./models/kategori')
// const Aset = require('./models/aset')
// const Permintaan = require('./models/permintaan')
// const Penyerahan = require('./models/penyerahan')
// const Pengembalian = require('./models/pengembalian')
// const PengajuanCek = require('./models/pengajuanCek')
// const PengembalianVendor = require('./models/pengembalianVendor')
// const Pemeliharaan = require('./models/pemeliharaan')
// const DetailPemeliharaan = require('./models/detailPemeliharaan')


const db = require("./config/db");
require('dotenv/config')


const PORT = process.env.PORT;
const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(route)


  
// Middleware untuk melayani file statis dari folder "public"
app.use(express.static(path.join(__dirname, 'public')));



app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(profileMiddleware);

app.get('/', (req, res) => {
    res.render('login');
  });



// db.sync({alter: true})



app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
})