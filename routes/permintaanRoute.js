const express = require('express');
const permintaanRouter = express.Router();
const PermintaanController = require('../controllers/permintaanControllers');
const verifyToken= require ('../middleware/validtokenMiddleware');
const role = require("../middleware/checkroleMiddleware");
const upload = require('../middleware/uploadMiddleware');
//admin
  // Endpoint untuk admin: Bisa melihat semua permintaan aset dari semua karyawan
  permintaanRouter.get(
    '/admin/permintaanAset',
    verifyToken,
    role("admin"),
    PermintaanController.getPermintaanAsetAdmin
  );
  
// Route untuk menampilkan detail permintaan berdasarkan ID
permintaanRouter.get(
  '/admin/permintaanAset/:id',
  verifyToken,
  role("admin"),
  PermintaanController.getDetailPermintaanAset
);

// Endpoint untuk admin: Mengubah status permintaan aset (Setujui, Tolak)
permintaanRouter.patch(
  '/admin/permintaanAset/:id/status',
  verifyToken,
  role("admin"),
  PermintaanController.updateStatusPermintaanAset
);
  
//karyawan

// Endpoint untuk karyawan: Hanya bisa melihat permintaan aset mereka sendiri


permintaanRouter.get(
    '/karyawan/permintaanAset',
    verifyToken,
    role("karyawan"),
    PermintaanController.getPermintaanAsetKaryawan
  );
  
  // Endpoint untuk menghapus permintaan aset oleh karyawan
permintaanRouter.delete(
  '/karyawan/permintaanAset/:id',
  verifyToken,
  role("karyawan"),
  PermintaanController.deletePermintaanAset
);

// Endpoint untuk membuat permintaan aset oleh karyawan
permintaanRouter.post('/karyawan/permintaanAset', verifyToken, role("karyawan"), PermintaanController.createPermintaanAset);

permintaanRouter.post(
  '/karyawan/permintaanAset/uploadTandaTangan',
  verifyToken,
  role("karyawan"),
  upload.single('file'),
  PermintaanController.uploadTtd
);

module.exports = permintaanRouter