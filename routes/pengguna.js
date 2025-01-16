const express = require('express');
const router = express.Router();
const path = require('path');

// Route untuk menampilkan halaman home
router.get('/pengguna/home', (req, res) => {
    res.render('pengguna/home');
});

module.exports = router;
