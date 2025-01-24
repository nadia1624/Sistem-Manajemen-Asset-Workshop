const express = require('express');
const vendorGudangControllers = require('../controllers/VendorGudangControllers');
const verifyToken = require('../middleware/validtokenMiddleware');
const role = require("../middleware/checkroleMiddleware");


const pengembalianVendorRouter = express.Router()

//admin
pengembalianVendorRouter.get('/admin/asetKaryawan', (req, res) => {
    res.render('admin/pengembalianVendor/asetKaryawan');
});
pengembalianVendorRouter.get('/admin/asetGudang', 
    verifyToken, 
    role("admin"), 
    vendorGudangControllers.getReturnGudang
);
pengembalianVendorRouter.get('/admin/riwayatVendor', 
    verifyToken, 
    role("admin"), 
    vendorGudangControllers.getRiwayatPengembalianVendor
);

pengembalianVendorRouter.get('/admin/detailAsetKaryawan', (req, res) => {
    res.render('admin/pengembalianVendor/detailAsetKaryawan');
}); 

pengembalianVendorRouter.get('/admin/detailAsetGudang/:id', 
    verifyToken, 
    role("admin"), 
    vendorGudangControllers.getDetailVendorGudang
);

pengembalianVendorRouter.get('/admin/detailAsetRiwayat/:id', 
    verifyToken, 
    role("admin"), 
    vendorGudangControllers.getDetailRiwayatVendor
);

module.exports = pengembalianVendorRouter