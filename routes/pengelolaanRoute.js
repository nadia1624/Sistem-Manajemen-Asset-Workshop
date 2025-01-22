const express = require('express');
const verifyToken = require ('../middleware/validtokenMiddleware');
const role = require("../middleware/checkroleMiddleware");
const upload = require('../middleware/uploadMiddleware');
const { tambahKategori } = require('../controllers/pengelolaanController');


const router = express.Router();

router.get('/karyawan/daftar-aset', verifyToken, role('karyawan') ,(req, res) => {
    res.render('karyawan/daftarAset/daftar-aset', { req: req });
});

router.get('/karyawan/detail-aset', verifyToken, role('karyawan') ,(req, res) => {
    res.render('karyawan/daftarAset/detail-aset', { req: req });
});

router.get('/admin/pengelolaan-aset', verifyToken, role('admin'), (req, res) => {
    res.render('admin/pengelolaanAset/listKategoriAset', { req: req });
});

router.post('/admin/tambah-kategori', verifyToken, role('admin'), upload.single('gambar'), tambahKategori);

router.get('/admin/list-aset', verifyToken, role('admin'), (req, res) => {
    res.render('admin/pengelolaanAset/listAset', { req: req });
});

router.get('/admin/info-aset', verifyToken, role('admin'), (req, res) => {
    res.render('admin/pengelolaanAset/detailAset', { req: req });
});

module.exports = router;
