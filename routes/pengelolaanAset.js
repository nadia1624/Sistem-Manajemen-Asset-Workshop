const express = require('express');
const router = express.Router();

// Route untuk menampilkan halaman home
router.get('/karyawan/daftar-aset', (req, res) => {
    res.render('pengguna/pengelolaanAset/daftar-aset', { req: req });
});

router.get('/admin/pengelolaan-aset', (req, res) => {
    res.render('admin/pengelolaanAset/listKategoriAset', { req: req });
});

module.exports = router;
