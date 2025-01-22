const { Permintaan, Aset, User, Kategori, Penyerahan } = require('../models');
const { Sequelize } = require('sequelize');

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
              required: true, // Tambahkan ini untuk memastikan `Aset` harus ada
              include: [
                  {
                      model: Kategori,
                      attributes: ["nama_kategori", "deskripsi"]
                  }
              ]
          },
          {
              model: User,
              attributes: ["nama", "email", "unit_kerja", "jabatan", "no_hp"]
          }
      ]
  });
  

      if (listPermintaan.length === 0) {
          return res.render('karyawan/permintaan/permintaanAset', { listPermintaan, currentPath });
      }

      res.render('karyawan/permintaan/permintaanAset', {
          listPermintaan: listPermintaan.map((p) => ({
              ...p.dataValues,
              tanggal_permintaan: new Date(p.tanggal_permintaan).toLocaleDateString('id-ID', {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
              }),
          })),
          currentPath, // Tambahkan currentPath ke objek render
      });
  } catch (error) {
      console.error("Error saat mengambil permintaan aset:", error);
      return res.status(500).json({ message: "Terjadi kesalahan saat mengambil permintaan aset." });
  }
};

const deletePermintaanAset = async (req, res) => {
  const { id } = req.params; // ID permintaan dari parameter URL
  const userId = req.userId; // ID karyawan yang login

  try {
    const permintaan = await Permintaan.findOne({ where: { id, userId } });

    // Validasi: hanya dapat menghapus permintaan dengan status "diproses"
    if (!permintaan || permintaan.status_permintaan !== "diproses") {
      return res.status(403).json({ message: "Tidak dapat menghapus permintaan ini." });
    }

    // Hapus permintaan dari database
    await Permintaan.destroy({ where: { id, userId } });

    res.status(200).json({ message: "Permintaan berhasil dihapus." });
  } catch (error) {
    console.error("Error saat menghapus permintaan aset:", error);
    res.status(500).json({ message: "Terjadi kesalahan saat menghapus permintaan." });
  }
};


// Controller untuk melihat permintaan aset admin
const getPermintaanAsetAdmin = async (req, res) => {
  try {
    // Ambil semua permintaan aset dengan status selain 'dicancel'
    const listPermintaan = await Permintaan.findAll({
      where: {
        status_permintaan: {
          [Sequelize.Op.ne]: "dicancel", // Hanya ambil status selain 'dicancel'
        },
      },
      include: [
        {
          model: Aset,
          attributes: ["nama_barang", "serial_number", "kondisi_aset", "status_peminjaman"],
          include: [{ model: Kategori, attributes: ["nama_kategori", "gambar","deskripsi"] }]
        },
        {
          model: User,
          attributes: ["nama", "email", "unit_kerja"],
        },
      ],
      attributes: ["id", "status_permintaan", "tanggal_permintaan"],
      order: [["tanggal_permintaan", "DESC"]],
    });

    if (listPermintaan.length === 0) {
      return res.render('admin/permintaan/permintaanAset', { listPermintaan });
    }

    // Render halaman permintaan aset admin
    res.render('admin/permintaan/permintaanAset', {
      listPermintaan: listPermintaan.map((p) => ({
        ...p.dataValues,
        tanggal_permintaan: new Date(p.tanggal_permintaan).toLocaleDateString('id-ID', {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
      })),
    });
  } catch (error) {
    console.error("Error saat mengambil permintaan aset:", error);
    return res.status(500).json({ message: "Gagal mengambil permintaan aset admin." });
  }
};

// Controller untuk melihat detail permintaan oleh admin
const getDetailPermintaanAset = async (req, res) => {
  const { id } = req.params; // Mengambil ID permintaan dari parameter URL

  try {
    const permintaan = await Permintaan.findOne({
      where: { id },
      include: [
        {
          model: Aset,
          attributes: ["nama_barang", "serial_number",  "kondisi_aset"],
          include: [{ model: Kategori, attributes: ["nama_kategori", "gambar","deskripsi"] }]
        },
        {
          model: User,
          attributes: ["nama", "unit_kerja", "jabatan", "email", "no_hp"]
        }
      ]
    });

    if (!permintaan) {
      return res.status(404).render('errorPage', { message: 'Permintaan tidak ditemukan.' });
    }

    // Render halaman detail permintaan
    res.render('admin/permintaan/detailPermintaan', {
      permintaan: {
        ...permintaan.dataValues,
        tanggal_permintaan: new Date(permintaan.tanggal_permintaan).toLocaleDateString('id-ID', {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
      }
    });
  } catch (error) {
    console.error("Error saat mengambil detail permintaan:", error);
    return res.status(500).render('errorPage', { message: "Gagal memuat detail permintaan." });
  }
};

const updateStatusPermintaanAset = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["diterima", "ditolak"].includes(status)) {
    return res.status(400).json({ message: "Status tidak valid." });
  }

  try {
    const permintaan = await Permintaan.findOne({ where: { id } });

    if (!permintaan || permintaan.status_permintaan !== "diproses") {
      return res.status(403).json({ message: "Permintaan tidak dapat diubah statusnya." });
    }

    // Update status permintaan
    await Permintaan.update({ status_permintaan: status }, { where: { id } });

    res.status(200).json({ message: "Status permintaan berhasil diperbarui." });
  } catch (error) {
    console.error("Error saat memperbarui status permintaan:", error);
    res.status(500).json({ message: "Gagal memperbarui status permintaan." });
  }
};

const uploadTandaTangan = async (req, res) => {
  const { permintaanId } = req.body; // ID permintaan yang diupload tanda tangannya
  const userId = req.userId; // ID user yang melakukan upload

  // Validasi apakah permintaanId ada dan valid
  if (!permintaanId) {
    return res.status(400).json({ message: 'ID permintaan tidak ditemukan' });
  }

  try {
    const permintaan = await Permintaan.findOne({ where: { id: permintaanId, userId } });

    if (!permintaan) {
      return res.status(404).json({ message: 'Permintaan tidak ditemukan atau akses ditolak' });
    }

    // Mendapatkan file tanda tangan yang diupload
    const { file } = req.files; // Pastikan menggunakan middleware seperti `express-fileupload` atau `multer` untuk menangani file upload

    if (!file) {
      return res.status(400).json({ message: 'Tanda tangan tidak ditemukan' });
    }

    // Simpan file tanda tangan
    const tandaTanganPath = `/uploads/tanda_tangan/${file.name}`;
    file.mv(`./public${tandaTanganPath}`, async (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Terjadi kesalahan saat menyimpan tanda tangan' });
      }

      // Simpan data ke tabel Penyerahan
      await Penyerahan.create({
        permintaanId,
        tanda_tangan: tandaTanganPath,
        status_penyerahan: 'belum diserahkan', // Status awal
        tanggal_penyerahan: new Date(),
      });

      res.status(200).json({ message: 'Tanda tangan berhasil diupload dan disimpan' });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan saat upload tanda tangan' });
  }
};

module.exports = { createPermintaanAset, getPermintaanAsetAdmin, getDetailPermintaanAset, updateStatusPermintaanAset, getPermintaanAsetKaryawan, deletePermintaanAset , uploadTandaTangan};
