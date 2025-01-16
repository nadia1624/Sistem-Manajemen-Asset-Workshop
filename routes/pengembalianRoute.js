const express = require('express')

const pengembalianRouter = express.Router()

//admin
pengembalianRouter.get('/admin/pengembalianAset', (req, res) => {
    res.render('admin/pengembalianAset');
});
pengembalianRouter.get('/admin/riwayatPengembalian', (req, res) => {
    res.render('admin/riwayatPengembalian');
});

//karyawan

module.exports = pengembalianRouter