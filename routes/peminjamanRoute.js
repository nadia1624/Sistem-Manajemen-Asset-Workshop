const express = require('express')

const peminjamanRouter = express.Router()


//karyawan
peminjamanRouter.get('/karyawan/peminjamanAset', (req, res) => {
    const currentPath = req.path; // Dapatkan path saat ini
    res.render('karyawan/peminjaman/peminjamanAset', { currentPath }); // Kirim currentPath ke template
});

peminjamanRouter.get('/karyawan/laporanCek', (req, res) => {
    const currentPath = req.path; // Dapatkan path saat ini
    res.render('karyawan/peminjaman/laporanCek', { currentPath }); // Kirim currentPath ke template
});

module.exports = peminjamanRouter