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

penyerahanRouter.patch(
    "/penyerahanAset/:id",
    upload.single("gambar_bukti"),
    verifyToken,
    role("admin"),
    PenyerahanController.updatePenyerahan
  );


module.exports = penyerahanRouter;
