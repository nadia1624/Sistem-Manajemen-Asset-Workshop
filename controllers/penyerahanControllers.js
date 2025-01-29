const { Permintaan, Aset, User, Kategori, Penyerahan } = require('../models');
const libre = require('libreoffice-convert');
const fs = require("fs");
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
// const { getImageXml } = require("docxtemplater-image-module/js/templates");
// const image_module = require("docxtemplater-image-module-free");

const getPenyerahan = async (req, res) => {
  try {
    const listPenyerahan = await Penyerahan.findAll({
      include: [
        {
          model: Permintaan,
          attributes: ["id", "status_permintaan"],
          include: [
            {
              model: Aset,
              attributes: ["nama_barang", "serial_number"],
              include: [
                { 
                  model: Kategori, 
                  attributes: ["nama_kategori", "gambar", "deskripsi"] }]
            },
            {
              model: User,
              attributes: ["nama", "email", "unit_kerja"]
            }
          ]
        }
      ],
       order: [
        ["id", "DESC"], // Urutkan berdasarkan ID secara menurun (DESC)
        ["tanggal_penyerahan", "DESC"], // Urutkan berdasarkan tanggal penyerahan secara menurun (DESC)
      ]
    });


    res.render('admin/penyerahan/penyerahanAset', {
        listPenyerahan: listPenyerahan.map((p) => ({
          ...p.dataValues,
          tandaTanganAda: !!p.Penyerahan, // true jika tanda tangan sudah ada
          tanggal_permintaan: new Date(p.tanggal_penyerahan).toLocaleDateString('id-ID', {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
        })),
      });
  } catch (error) {
    console.error('Error mengambil data penyerahan:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
};


const updatePenyerahan = async (req, res) => {
  console.log("Memulai proses penyerahan aset...");
  console.log("Params:", req.params); // Log parameter URL
  console.log("Body:", req.body); // Log body form
  console.log("File:", req.file); // Log file yang diunggah

  const { id } = req.params; // Ambil ID penyerahan dari parameter URL
  const { penerima } = req.body; // Ambil penerima dari body
  const gambarBuktiPath = req.file ? `${req.file.filename}` : null; // Path file yang diunggah (jika ada)
  const tanggalPenyerahan = new Date();

  if (!id || !penerima || !gambarBuktiPath) {
    console.error("Input tidak lengkap.");
    return res.status(400).json({ error: "Input tidak lengkap." });
  }

  try {
    // **Tahap 1: Validasi Input**
    console.log(`[STEP 1] Validasi input`);
    if (!id) {
      console.error(`[ERROR] ID penyerahan tidak ditemukan.`);
      return res.status(400).json({ error: 'ID penyerahan tidak ditemukan.' });
    }
    if (!penerima) {
      console.error(`[ERROR] Nama penerima tidak diisi.`);
      return res.status(400).json({ error: 'Nama penerima harus diisi.' });
    }

    // **Tahap 2: Cari Data Penyerahan**
    console.log(`[STEP 2] Mencari data penyerahan di database`);
    const penyerahan = await Penyerahan.findByPk(id, {
      include: [
        {
          model: Permintaan,
          include: [
            { model: User, attributes: ["nama", "unit_kerja"] }, // Menyertakan informasi user
            { model: Aset, attributes: ["nama_barang", "serial_number", "status_peminjaman"] } // Menyertakan informasi aset
          ],
        },
      ],
    });

    if (!penyerahan) {
      console.error(`[ERROR] Data penyerahan tidak ditemukan untuk ID: ${id}`);
      return res.status(404).json({ error: 'Data penyerahan tidak ditemukan.' });
    }
    console.log(`[INFO] Data penyerahan ditemukan:`, penyerahan);

    // **Tahap 3: Update Data Penyerahan**
    console.log(`[STEP 3] Memperbarui data penyerahan di database`);
    penyerahan.penerima = penerima;
    penyerahan.gambar_bukti = gambarBuktiPath || penyerahan.gambar_bukti;
    penyerahan.status_penyerahan = 'sudah diserahkan'; // Memastikan status diubah menjadi "telah diserahkan"
    penyerahan.tanggal_penyerahan = tanggalPenyerahan;

    // Simpan perubahan status penyerahan
    await penyerahan.save();
    console.log(`[INFO] Data penyerahan berhasil diperbarui dan status penyerahan diubah menjadi 'telah diserahkan'.`);

    // **Tahap 4: Update Status Peminjaman Aset**
    console.log(`[STEP 4] Memperbarui status peminjaman aset`);
    const permintaan = penyerahan.Permintaan; // Mengakses data permintaan terkait
    if (permintaan && permintaan.serial_number) {
      await Aset.update(
        { status_peminjaman: "dipinjam" },
        { where: { serial_number: permintaan.serial_number } }
      );
      console.log(`[INFO] Status peminjaman aset berhasil diperbarui menjadi 'dipinjam' untuk serial number: ${permintaan.serial_number}`);
    } else {
      console.warn(`[WARNING] Data serial number aset tidak ditemukan dalam permintaan.`);
    }

    // Respon sukses
    res.status(200).json({
      message: 'Aset berhasil diserahkan dan status peminjaman diperbarui.',
      penyerahan: penyerahan, // Mengirimkan objek penyerahan yang telah diperbarui
    });
    console.log(`[SUCCESS] Proses serahkan aset selesai untuk ID: ${id}`);
  } catch (error) {
    console.error(`[ERROR] Terjadi kesalahan dalam proses serahkan aset:`, error.message);

    // Hapus file yang diunggah jika terjadi error
    if (gambarBuktiPath) {
      console.log(`[INFO] Menghapus file bukti yang diunggah: ${gambarBuktiPath}`);
      fs.unlinkSync(gambarBuktiPath);
    }

    res.status(500).json({ error: 'Terjadi kesalahan dalam memproses penyerahan aset.' });
  }
};





module.exports = { getPenyerahan , updatePenyerahan};
