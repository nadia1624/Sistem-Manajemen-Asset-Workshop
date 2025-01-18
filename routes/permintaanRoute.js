const express = require('express')

const permintaanRouter = express.Router()

//admin
permintaanRouter.get('/admin/permintaanAset', (req, res) => {
    res.render('admin/permintaan/permintaanAset');
});

permintaanRouter.get('/admin/detailPermintaan', (req, res) => {
    res.render('admin/permintaan/detailPermintaan');
});

//karyawan
permintaanRouter.get('/karyawan/permintaanAset', (req, res) => {
    const currentPath = req.path; // Dapatkan path saat ini
    res.render('karyawan/permintaan/permintaanAset', { currentPath }); // Kirim currentPath ke template
});
module.exports = permintaanRouter