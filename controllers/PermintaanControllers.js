const { Permintaan, Aset, User } = require('../models');

// Controller untuk membuat permintaan aset oleh karyawan
const createPermintaanAset = async (req, res) => {
  const { serial_number } = req.body;
  const userId = req.userId; // Menggunakan user ID yang sudah didecode dari token

  // Pastikan hanya karyawan yang bisa membuat permintaan
  if (req.user.role !== 'karyawan') {
    return res.status(403).json({ message: 'Akses terlarang. Hanya karyawan yang dapat membuat permintaan aset.' });
  }

  if (!serial_number) {
    return res.status(400).json({ message: 'Serial number aset tidak ditemukan' });
  }

  try {
    // Validasi apakah aset dengan serial_number ada
    const aset = await Aset.findOne({ where: { serial_number } });
    if (!aset) {
      return res.status(404).json({ message: 'Aset tidak ditemukan' });
    }

    // Membuat permintaan aset baru
    await Permintaan.create({
      serial_number,
      userId,
      status_permintaan: 'diproses', // Status awal permintaan
      tanggal_permintaan: new Date(),
    });

    // Redirect ke halaman permintaan aset karyawan setelah berhasil
    return res.redirect('/karyawan/permintaan/permintaanAset'); // Menggunakan redirect, bukan render

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Terjadi kesalahan saat membuat permintaan' });
  }
};

const getPermintaanAsetKaryawan = async (req, res) => {
    const userId = req.userId; // Pastikan `userId` tersedia setelah verifikasi token
    const currentPath = req.path;
  
    try {
      const listPermintaan = await Permintaan.findAll({
        where: { userId },
        include: [
          {
            model: Aset,
            attributes: ["nama_barang", "serial_number", "kondisi_aset", "status_peminjaman"],
          },
        ],
        attributes: ["id", "status_permintaan", "tanggal_permintaan"],
        order: [["tanggal_permintaan", "DESC"]],
      });
  
      // Cek apakah listPermintaan kosong
      if (listPermintaan.length === 0) {
        return res.render('karyawan/permintaan/permintaanAset', { listPermintaan, currentPath });
      }
  
      // Render halaman permintaan aset karyawan jika ada data
      return res.render('karyawan/permintaan/permintaanAset', { listPermintaan, currentPath });
  
    } catch (error) {
      console.error("Error saat mengambil permintaan aset:", error);
      return res.status(500).json({ message: "Terjadi kesalahan saat mengambil permintaan aset." });
    }
  };
  

// Controller untuk melihat permintaan aset admin
const getPermintaanAsetAdmin = async (req, res) => {
  try {
    // Ambil semua permintaan aset dari semua karyawan
    const listPermintaan = await Permintaan.findAll({
      include: [
        {
          model: Aset,
          attributes: ["nama_barang", "serial_number", "kondisi_aset", "status_peminjaman"],
        },
        {
          model: User,
          attributes: ["nama", "email"],
        },
      ],
      attributes: ["id", "status_permintaan", "tanggal_permintaan"],
      order: [["tanggal_permintaan", "DESC"]],
    });

    if (listPermintaan.length === 0) {
      return res.render('admin/permintaan/permintaanAset', {listPermintaan});
    }

    // Render halaman permintaan aset admin
    return res.render('admin/permintaan/permintaanAset'), {listPermintaan};
  } catch (error) {
    console.error("Error saat mengambil permintaan aset:", error);
    return res.status(500).json({ message: "Gagal mengambil permintaan aset admin." });
  }
};

module.exports = { createPermintaanAset, getPermintaanAsetAdmin, getPermintaanAsetKaryawan };
