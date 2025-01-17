const express = require('express')

const pengembalianVendorRouter = express.Router()

//admin
pengembalianVendorRouter.get('/admin/asetKaryawan', (req, res) => {
    res.render('admin/pengembalianVendor/asetKaryawan');
});
pengembalianVendorRouter.get('/admin/asetGudang', (req, res) => {
    res.render('admin/pengembalianVendor/asetGudang');
});
pengembalianVendorRouter.get('/admin/riwayatVendor', (req, res) => {
    res.render('admin/pengembalianVendor/riwayatVendor');
});
//karyawan

module.exports = pengembalianVendorRouter