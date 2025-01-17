const express = require('express')

const pengajuanCekRouter = express.Router()

//admin
pengajuanCekRouter.get('/admin/daftarPengajuanCek', (req, res) => {
    res.render('admin/pengajuanCek/daftarPengajuanCek');
});

pengajuanCekRouter.get('/admin/detailPengajuanCek', (req, res) => {
    res.render('admin/pengajuanCek/detailPengajuanCek');
});


module.exports = pengajuanCekRouter