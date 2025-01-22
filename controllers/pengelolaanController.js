const path = require('path');
const { Kategori } = require('../models');

const tambahKategori = async (req, res) => {
    try {
        const { namaKategori, deskripsi } = req.body;

        // Menangani gambar yang telah diunggah
        const gambar = req.file ? `${req.file.filename}` : null;

        // Validasi input
        if (!namaKategori || !deskripsi || !gambar) {
            return res.status(400).json({ message: 'Semua data harus diisi!' });
        }

        await Kategori.create({
            nama_kategori: namaKategori,
            deskripsi,
            gambar: gambar,
          });

          return res.redirect('/admin/pengelolaan-aset');

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

module.exports = {
    tambahKategori,
};