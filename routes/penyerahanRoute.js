const express = require('express');
const PenyerahanController = require('../controllers/penyerahanControllers');
const verifyToken = require('../middleware/validtokenMiddleware');
const role = require('../middleware/checkroleMiddleware');
const multer = require('multer');
const penyerahanRouter = express.Router();
const upload = require('../middleware/uploadMiddleware');

// Route untuk mendapatkan data penyerahan (sudah ada)
penyerahanRouter.get(
  '/admin/penyerahanAset',
  verifyToken,
  role("admin"),
  PenyerahanController.getPenyerahan
);

penyerahanRouter.post(
    "/penyerahan-aset/:id",
    upload.single("gambar_bukti"),
    verifyToken,
    role("admin"),
    PenyerahanController.updatePenyerahan
  );

// Route untuk serahkan aset
// fetch('/admin/serahkanAset', {
//     method: 'POST',
//     body: formData,
//   }).then((response) => {
//     if (response.ok) {
//       alert('Penyerahan berhasil!');
//       window.location.reload();
//     } else {
//       alert('Terjadi kesalahan, silakan coba lagi.');
//     }
//   });

module.exports = penyerahanRouter;
