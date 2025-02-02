const express = require('express');
const vendorGudangControllers = require('../controllers/VendorGudangControllers');
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

pengembalianVendorRouter.put('/admin/updatestatus/:id', 
    verifyToken, 
    role("admin"), 
    karyawanVendorControllers.updateStatusVendorKaryawan
);

pengembalianVendorRouter.post('/admin/updatepengembalianKaryawan/:id', 
    verifyToken, 
    role("admin"), 
    karyawanVendorControllers.updateStatusPengembalianKaryawan
);

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

pengembalianVendorRouter.put('/admin/updatestatus/:id', 
    verifyToken, 
    role("admin"), 
    vendorGudangControllers.updateStatusVendorGudang
);

pengembalianVendorRouter.put('/admin/updatepengembalian/:id', 
    verifyToken, 
    role("admin"), 
    vendorGudangControllers.updateStatusPengembalian
);


module.exports = pengembalianVendorRouter