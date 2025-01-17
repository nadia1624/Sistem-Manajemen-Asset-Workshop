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
pengembalianVendorRouter.get('/admin/detailAsetGudang', (req, res) => {
    res.render('admin/pengembalianVendor/detailAsetGudang');
});
pengembalianVendorRouter.get('/admin/detailAsetRiwayat', (req, res) => {
    res.render('admin/pengembalianVendor/detailAsetRiwayat');
});

//karyawan

module.exports = pengembalianVendorRouter