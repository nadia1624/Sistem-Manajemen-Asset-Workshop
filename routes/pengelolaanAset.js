const express = require('express');
const verifyToken= require ('../middleware/validtokenMiddleware');
const role = require("../middleware/checkroleMiddleware");

const router = express.Router();

router.get('/karyawan/daftar-aset', verifyToken, role('karyawan') ,(req, res) => {
    res.render('karyawan/daftarAset/daftar-aset', { req: req });
});


router.get('/admin/pengelolaan-aset', (req, res) => {
    res.render('admin/pengelolaanAset/listKategoriAset', { req: req });
});

router.get('/admin/list-aset', (req, res) => {
    res.render('admin/pengelolaanAset/listAset', { req: req });
});

router.get('/admin/info-aset', (req, res) => {
    res.render('admin/pengelolaanAset/detailAset', { req: req });
});

module.exports = router;
