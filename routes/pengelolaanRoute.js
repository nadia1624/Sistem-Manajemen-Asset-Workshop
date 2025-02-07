const express = require('express');
const verifyToken = require ('../middleware/validtokenMiddleware');
const role = require("../middleware/checkroleMiddleware");
const upload = require('../middleware/uploadMiddleware');
const { tampilkanAsetBerdasarkanKategori, tampilkanKategori, tambahKategori, tampilkanEditKategori, editKategori, tambahAset, editAset, hapusKategori, tampilkanEditAset, hapusAset, tampilkanDetailAset, tampilkanDaftarAsetKaryawan, tampilkanDetailAsetKaryawan } = require('../controllers/pengelolaanController');
const router = express.Router();
const profileMiddleware = require('../middleware/profilMiddleware')

router.get('/karyawan/daftar-aset', verifyToken, role('karyawan'),profileMiddleware, tampilkanDaftarAsetKaryawan);

router.get('/karyawan/detail-aset/:id', verifyToken, role('karyawan'),profileMiddleware, tampilkanDetailAsetKaryawan);

router.get('/admin/pengelolaan-aset', verifyToken, role('admin'), tampilkanKategori);

router.post('/admin/tambah-kategori', verifyToken, role('admin'), upload.single('gambar'), tambahKategori);

router.get('/admin/edit-kategori/:id', verifyToken, role('admin'), tampilkanEditKategori);

// Route untuk memproses edit kategori
router.post('/admin/edit-kategori/:id', verifyToken, role('admin'), upload.single('gambar'), editKategori);

router.delete('/admin/hapus-kategori/:id', verifyToken, role('admin'), hapusKategori);

router.get('/admin/list-aset/:id', verifyToken, role('admin'), tampilkanAsetBerdasarkanKategori);

router.post('/admin/tambah-aset', verifyToken, role('admin'), tambahAset);

router.get('/admin/edit-aset/:serialNumber', verifyToken, role('admin'), tampilkanEditAset);

router.post('/admin/edit-aset/:serialNumber', verifyToken, role('admin'), editAset);

router.delete('/admin/hapus-aset/:serialNumber', verifyToken, role('admin'), hapusAset);

router.get('/admin/info-aset/:id', verifyToken, role('admin'), tampilkanDetailAset);

module.exports = router;
