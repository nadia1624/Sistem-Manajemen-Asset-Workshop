const express = require('express')

const pengembalianRouter = express.Router()

//admin
pengembalianRouter.get('/admin/pengembalianAset', (req, res) => {
    res.render('admin/pengembalian/pengembalianAset');
});
pengembalianRouter.get('/admin/riwayatPengembalian', (req, res) => {
    res.render('admin/pengembalian/riwayatPengembalian');
});
pengembalianRouter.get('/karyawan/riwayatKaryawan', (req, res) => {
    const currentPath = req.path;
    res.render('karyawan/riwayat/riwayatKaryawan', { currentPath }); 
});

//karyawan

module.exports = pengembalianRouter