const express = require('express')

const pengajuanCekRouter = express.Router()

//admin
pengajuanCekRouter.get('/admin/daftarPengajuanCek', (req, res) => {
    res.render('admin/pengajuanCek/daftarPengajuanCek');
});

module.exports = pengajuanCekRouter