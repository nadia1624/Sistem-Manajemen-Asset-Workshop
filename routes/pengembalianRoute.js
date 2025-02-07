const express = require('express');
const pengembalianControllers = require('../controllers/pengembalianControllers');
const verifyToken = require('../middleware/validtokenMiddleware');
const upload = require('../middleware/uploadMiddleware');
const role = require("../middleware/checkroleMiddleware");
const profileMiddleware = require('../middleware/profilMiddleware')

const pengembalianRouter = express.Router()

//admin
pengembalianRouter.get('/admin/pengembalianAset',
    verifyToken, 
    role("admin"), 
    pengembalianControllers.getPengembalian
);

pengembalianRouter.get('/admin/riwayatPengembalian', 
    verifyToken, 
    role("admin"), 
    pengembalianControllers.riwayatPengembalian
);

pengembalianRouter.get('/karyawan/riwayatKaryawan',
    verifyToken, 
    role("karyawan"), 
    profileMiddleware,
    pengembalianControllers.getRiwayatKaryawan
);

pengembalianRouter.post('/admin/pengembalianAset/:id',
    verifyToken,
    role("admin"),
    upload.single('buktiGambar'),
    pengembalianControllers.addAssetReturn
);

//karyawan
pengembalianRouter.post('/karyawan/return/:idpenyerahan', 
    verifyToken, 
    role("karyawan"), 
    pengembalianControllers.returnAset
);

module.exports = pengembalianRouter