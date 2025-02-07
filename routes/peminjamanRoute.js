const express = require('express');
const peminjamanControllers = require('../controllers/peminjamanControllers');
const verifyToken = require('../middleware/validtokenMiddleware');
const role = require("../middleware/checkroleMiddleware");
const profileMiddleware = require('../middleware/profilMiddleware')

const peminjamanRouter = express.Router()


peminjamanRouter.get('/karyawan/peminjamanAset', 
    verifyToken, 
    role("karyawan"), 
    profileMiddleware,
    peminjamanControllers.getPeminjaman
);

peminjamanRouter.get('/karyawan/laporanCek', 
    verifyToken, 
    role("karyawan"), 
    profileMiddleware,
    peminjamanControllers.getAllDataLaporancek
);


// peminjamanRouter.get('/karyawan/laporanCek', (req, res) => {
//     const currentPath = req.path; 
//     res.render('karyawan/peminjaman/laporanCek', { currentPath }); 
// });

peminjamanRouter.post('/karyawan/peminjamanAset/cek/:penyerahanId', verifyToken, role('karyawan'), peminjamanControllers.createPengajuanCek )

module.exports = peminjamanRouter