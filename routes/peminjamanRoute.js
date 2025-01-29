const express = require('express');
const peminjamanControllers = require('../controllers/peminjamanControllers');
const verifyToken = require('../middleware/validtokenMiddleware');
const role = require("../middleware/checkroleMiddleware");

const peminjamanRouter = express.Router()


peminjamanRouter.get('/karyawan/peminjamanAset', 
    verifyToken, 
    role("karyawan"), 
    peminjamanControllers.getPeminjaman
);

peminjamanRouter.get('/karyawan/laporanCek', 
    verifyToken, 
    role("karyawan"), 
    peminjamanControllers.getAllDataLaporancek
);


// peminjamanRouter.get('/karyawan/laporanCek', (req, res) => {
//     const currentPath = req.path; 
//     res.render('karyawan/peminjaman/laporanCek', { currentPath }); 
// });

peminjamanRouter.post('/karyawan/peminjamanAset/cek/:penyerahanId', verifyToken, role('karyawan'), peminjamanControllers.createPengajuanCek )

module.exports = peminjamanRouter