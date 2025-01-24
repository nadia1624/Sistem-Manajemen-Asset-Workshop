const { Permintaan, Aset, User, Kategori, Penyerahan } = require('../models');

const getPenyerahan = async (req, res) => {
    try {
      const penyerahanData = await Penyerahan.findAll({
        include: [
          {
            model: Permintaan, // Asosiasi dengan tabel Permintaan
            include: [
              { model: Aset }, // Asosiasi dengan tabel Aset
            ],
          },
        ],
      });
  
      res.render('admin/penyerahan/penyerahanAset', { penyerahanData }); // Kirim data ke view
    } catch (error) {
      console.error('Error mengambil data penyerahan:', error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
    }
  };
  

module.exports = { getPenyerahan};
