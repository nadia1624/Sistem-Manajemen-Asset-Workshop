const express = require('express');
const router = express.Router();

router.get('/karyawan/daftar-aset', (req, res) => {
    res.render('pengguna/pengelolaanAset/daftar-aset', { req: req });
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
