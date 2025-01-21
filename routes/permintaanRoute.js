const express = require('express');
const permintaanRouter = express.Router();
const PermintaanController = require('../controllers/PermintaanControllers');
const verifyToken= require ('../middleware/validtokenMiddleware');
const role = require("../middleware/checkroleMiddleware");
const { Aset } = require('../models'); // Menambahkan Aset model

//admin
  // Endpoint untuk admin: Bisa melihat semua permintaan aset dari semua karyawan
  permintaanRouter.get(
    '/admin/permintaanAset',
    verifyToken,
    role("admin"),
    PermintaanController.getPermintaanAsetAdmin
  );
  

permintaanRouter.get('/admin/detailPermintaan',verifyToken, role("admin"), (req, res) => {
    res.render('admin/permintaan/detailPermintaan');
});

//karyawan

// Endpoint untuk karyawan: Hanya bisa melihat permintaan aset mereka sendiri
permintaanRouter.get(
    '/karyawan/permintaanAset',
    verifyToken,
    role("karyawan"),
    PermintaanController.getPermintaanAsetKaryawan
  );
// Endpoint untuk membuat permintaan aset oleh karyawan
permintaanRouter.post('/karyawan/permintaanAset', verifyToken, role("karyawan"), PermintaanController.createPermintaanAset);

module.exports = permintaanRouter