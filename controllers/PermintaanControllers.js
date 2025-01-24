const { Permintaan, Aset, User, Kategori, Penyerahan } = require('../models');
const { Sequelize } = require('sequelize');
const path = require('path');
// Controller untuk membuat permintaan aset oleh karyawan
const createPermintaanAset = async (req, res) => {
  const { serial_number } = req.body;
  const userId = req.userId;

  if (!serial_number) {
    return res.status(400).json({ message: 'Serial number aset tidak ditemukan' });
  }

  try {
    const aset = await Aset.findOne({ where: { serial_number } });
    if (!aset) {
      return res.status(404).json({ message: 'Aset tidak ditemukan' });
    }

    await Permintaan.create({
      serial_number,
      userId,
      status_permintaan: 'diproses',
      tanggal_permintaan: new Date(),
    });

    return res.redirect('/karyawan/permintaanAset');
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
      order: [['tanggal_permintaan', 'DESC']], 
      include: [
        {
          model: Aset,
          attributes: ["nama_barang", "serial_number", "kondisi_aset", "status_peminjaman"],
          required: true,
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
        },
        {
          model: Penyerahan,
          attributes: ["id", "permintaanId"], // Cek apakah tanda tangan sudah ada
          required: false, // Karena tidak semua permintaan punya tanda tangan
        }
      ]
    });

    if (listPermintaan.length === 0) {
      return res.render('karyawan/permintaan/permintaanAset', { listPermintaan, currentPath });
    }

    res.render('karyawan/permintaan/permintaanAset', {
      listPermintaan: listPermintaan.map((p) => ({
        ...p.dataValues,
        tandaTanganAda: !!p.Penyerahan, // true jika tanda tangan sudah ada
        tanggal_permintaan: new Date(p.tanggal_permintaan).toLocaleDateString('id-ID', {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
      })),
      currentPath,
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

// const uploadTtd = async (req, res) => {
//   try {
//     const { permintaanId } = req.body;

//     if (!permintaanId) {
//       return res.status(400).json({ message: 'Permintaan ID tidak boleh kosong.' });
//     }

//     const permintaan = await Permintaan.findByPk(permintaanId);
//     if (!permintaan) {
//       return res.status(404).json({ message: 'Data permintaan tidak ditemukan.' });
//     }

//     if (!req.file || !req.file.path) {
//       return res.status(400).json({ message: 'File tanda tangan tidak ditemukan.' });
//     }

//     const penyerahan = await Penyerahan.create({
//       permintaanId,
//       tanda_tangan: req.file.path,
//       status_penyerahan: 'belum diserahkan',
//     });

//     console.log('Data berhasil disimpan:', penyerahan);

//     // Pastikan respons sukses dikirim
//     return res.status(201).json({
//       message: 'Tanda tangan berhasil diupload.',
//       data: penyerahan,
//     });
//   } catch (error) {
//     console.error('Error saat mengupload tanda tangan:', error);
//     return res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
//   }
// };

const uploadTtd = async (req, res) => {
  try {
    const { permintaanId } = req.body;

    if (!permintaanId) {
      return res.status(400).json({ message: 'Permintaan ID tidak boleh kosong.' });
    }

    const permintaan = await Permintaan.findByPk(permintaanId);
    if (!permintaan) {
      return res.status(404).json({ message: 'Data permintaan tidak ditemukan.' });
    }

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'File tanda tangan tidak ditemukan.' });
    }

    // Periksa apakah sudah ada penyerahan untuk permintaanId ini
    const existingPenyerahan = await Penyerahan.findOne({ where: { permintaanId } });
    if (existingPenyerahan) {
      return res.status(400).json({ message: 'Tanda tangan untuk permintaan ini sudah ada.' });
    }

    // Buat data penyerahan baru
    await Penyerahan.create({
      permintaanId,
      tanda_tangan: req.file.path,
      status_penyerahan: 'belum diserahkan',
    });

    // Kirim pesan sukses
    return res.status(200).json({ message: 'Tanda tangan berhasil diupload.' });
  } catch (error) {
    console.error('Error saat mengupload tanda tangan:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
};







module.exports = { createPermintaanAset, getPermintaanAsetAdmin, getDetailPermintaanAset, updateStatusPermintaanAset, getPermintaanAsetKaryawan, deletePermintaanAset , uploadTtd};
