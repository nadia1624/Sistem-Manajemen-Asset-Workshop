const express = require('express')

const penyerahanRouter = express.Router()

//admin
penyerahanRouter.get('/admin/penyerahanAset', (req, res) => {
    res.render('admin/penyerahan/penyerahanAset');
});


//karyawan
penyerahanRouter.get('/karyawan/penyerahanAset', (req, res) => {
    const currentPath = req.path; // Dapatkan path saat ini
    res.render('karyawan/penyerahan/penyerahanAset', { currentPath }); // Kirim currentPath ke template
});
module.exports = penyerahanRouter