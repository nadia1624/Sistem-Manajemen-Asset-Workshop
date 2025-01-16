const express = require('express')

const permintaanRouter = express.Router()

//admin
permintaanRouter.get('/admin/permintaanAset', (req, res) => {
    res.render('admin/permintaan/permintaanAset');
});


//karyawan

module.exports = permintaanRouter