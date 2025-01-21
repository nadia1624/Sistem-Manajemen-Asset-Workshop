const express = require('express');
const pengembalianControllers = require('../controllers/pengembalianControllers');
const verifyToken = require('../middleware/validtokenMiddleware');
const role = require("../middleware/checkroleMiddleware");

const pengembalianRouter = express.Router()

//admin
pengembalianRouter.get('/admin/pengembalianAset', (req, res) => {
    res.render('admin/pengembalian/pengembalianAset');
});
pengembalianRouter.get('/admin/riwayatPengembalian', (req, res) => {
    res.render('admin/pengembalian/riwayatPengembalian');
});
pengembalianRouter.get('/karyawan/riwayatKaryawan', (req, res) => {
    const currentPath = req.path;
    res.render('karyawan/riwayat/riwayatKaryawan', { currentPath }); 
});

//karyawan
pengembalianRouter.post('/karyawan/return/:idpenyerahan', 
    verifyToken, 
    role("karyawan"), 
    pengembalianControllers.returnAset
);

module.exports = pengembalianRouter