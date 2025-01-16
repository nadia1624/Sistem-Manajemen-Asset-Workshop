const express = require("express");
const route = require('./routes/index')
const path = require('path');
const bodyParser = require('body-parser')
const User = require('./models/user')
const Kategori = require('./models/kategori')
const Aset = require('./models/aset')
const Permintaan = require('./models/permintaan')
const Penyerahan = require('./models/penyerahan')
const Pengembalian = require('./models/pengembalian')
const PengajuanCek = require('./models/pengajuanCek')
const PengembalianVendor = require('./models/pengembalianVendor')
const Pemeliharaan = require('./models/pemeliharaan')
const DetailPemeliharaan = require('./models/detailPemeliharaan')


const db = require("./config/db");
require('dotenv/config')


const PORT = process.env.PORT;
const app = express();

app.use(express.json())
app.use(route)

  
// Middleware untuk melayani file statis dari folder "public"
app.use(express.static(path.join(__dirname, 'public')));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

db.sync({alter: true})

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
})