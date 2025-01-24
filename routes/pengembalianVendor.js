const express = require('express')
const karyawanVendorControllers = require('../controllers/karyawanVendorControllers');
const verifyToken = require('../middleware/validtokenMiddleware');
const role = require("../middleware/checkroleMiddleware");
const pengembalianVendorRouter = express.Router()

pengembalianVendorRouter.get('/admin/asetKaryawan', 
    verifyToken, 
    role("admin"), 
    karyawanVendorControllers.getReturnKaryawan
);

pengembalianVendorRouter.get('/admin/detailAsetKaryawan/:id', 
    verifyToken, 
    role("admin"), 
    karyawanVendorControllers.getDetailAsetKaryawanVendor
);

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


pengembalianVendorRouter.get('/admin/detailAsetKaryawan', (req, res) => {
    res.render('admin/pengembalianVendor/detailAsetKaryawan');
}); 

pengembalianVendorRouter.get('/admin/detailAsetGudang', (req, res) => {
    res.render('admin/pengembalianVendor/detailAsetGudang');
});
pengembalianVendorRouter.get('/admin/detailAsetRiwayat', (req, res) => {
    res.render('admin/pengembalianVendor/detailAsetRiwayat');

});

//karyawan

module.exports = pengembalianVendorRouter