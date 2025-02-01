const { Permintaan, Aset, User, Kategori, Penyerahan , sequelize} = require('../models');
const libre = require('libreoffice-convert');
const fs = require("fs");
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const { getImageXml } = require("docxtemplater-image-module/js/templates");
const { where } = require('sequelize');
const { Op } = require('sequelize');
const ImageModule = require('docxtemplater-image-module-free'); 

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


// const updatePenyerahan = async (req, res) => {
//   console.log("Memulai proses penyerahan aset...");
//   console.log("Params:", req.params); // Log parameter URL
//   console.log("Body:", req.body); // Log body form
//   console.log("File:", req.file); // Log file yang diunggah

//   const { id } = req.params; // Ambil ID penyerahan dari parameter URL
//   const { penerima } = req.body; // Ambil penerima dari body
//   const gambarBuktiPath = req.file ? `${req.file.filename}` : null; // Path file yang diunggah (jika ada)
//   const tanggalPenyerahan = new Date();

//   if (!id || !penerima || !gambarBuktiPath) {
//     console.error("Input tidak lengkap.");
//     return res.status(400).json({ error: "Input tidak lengkap." });
//   }

//   try {
//     // **Tahap 1: Validasi Input**
//     console.log(`[STEP 1] Validasi input`);
//     if (!id) {
//       console.error(`[ERROR] ID penyerahan tidak ditemukan.`);
//       return res.status(400).json({ error: 'ID penyerahan tidak ditemukan.' });
//     }
//     if (!penerima) {
//       console.error(`[ERROR] Nama penerima tidak diisi.`);
//       return res.status(400).json({ error: 'Nama penerima harus diisi.' });
//     }

//     // **Tahap 2: Cari Data Penyerahan**
//     console.log(`[STEP 2] Mencari data penyerahan di database`);
//     const penyerahan = await Penyerahan.findByPk(id, {
//       include: [
//         {
//           model: Permintaan,
//           include: [
//             { model: User, attributes: ["nama", "unit_kerja"] }, // Menyertakan informasi user
//             { model: Aset, attributes: ["nama_barang", "serial_number", "status_peminjaman"] } // Menyertakan informasi aset
//           ],
//         },
//       ],
//     });

//     if (!penyerahan) {
//       console.error(`[ERROR] Data penyerahan tidak ditemukan untuk ID: ${id}`);
//       return res.status(404).json({ error: 'Data penyerahan tidak ditemukan.' });
//     }
//     console.log(`[INFO] Data penyerahan ditemukan:`, penyerahan);

//     // **Tahap 3: Update Data Penyerahan**
//     console.log(`[STEP 3] Memperbarui data penyerahan di database`);
//     penyerahan.penerima = penerima;
//     penyerahan.gambar_bukti = gambarBuktiPath || penyerahan.gambar_bukti;
//     penyerahan.status_penyerahan = 'sudah diserahkan'; // Memastikan status diubah menjadi "telah diserahkan"
//     penyerahan.tanggal_penyerahan = tanggalPenyerahan;

//     // Simpan perubahan status penyerahan
//     await penyerahan.save();
//     console.log(`[INFO] Data penyerahan berhasil diperbarui dan status penyerahan diubah menjadi 'telah diserahkan'.`);

//     // **Tahap 4: Update Status Peminjaman Aset**
//     console.log(`[STEP 4] Memperbarui status peminjaman aset`);
//     const permintaan = penyerahan.Permintaan; // Mengakses data permintaan terkait
//     if (permintaan && permintaan.serial_number) {
//       await Aset.update(
//         { status_peminjaman: "dipinjam" },
//         { where: { serial_number: permintaan.serial_number } }
//       );
//       console.log(`[INFO] Status peminjaman aset berhasil diperbarui menjadi 'dipinjam' untuk serial number: ${permintaan.serial_number}`);
//     } else {
//       console.warn(`[WARNING] Data serial number aset tidak ditemukan dalam permintaan.`);
//     }

//     // Respon sukses
//     res.status(200).json({
//       message: 'Aset berhasil diserahkan dan status peminjaman diperbarui.',
//       penyerahan: penyerahan, // Mengirimkan objek penyerahan yang telah diperbarui
//     });
//     console.log(`[SUCCESS] Proses serahkan aset selesai untuk ID: ${id}`);
//   } catch (error) {
//     console.error(`[ERROR] Terjadi kesalahan dalam proses serahkan aset:`, error.message);

//     // Hapus file yang diunggah jika terjadi error
//     if (gambarBuktiPath) {
//       console.log(`[INFO] Menghapus file bukti yang diunggah: ${gambarBuktiPath}`);
//       fs.unlinkSync(gambarBuktiPath);
//     }

//     res.status(500).json({ error: 'Terjadi kesalahan dalam memproses penyerahan aset.' });
//   }
// };




const updatePenyerahan = async (req, res) => {
  console.log("Memulai proses penyerahan aset...");
  const { id } = req.params;
  const { penerima } = req.body;
  const gambarBuktiPath = req.file ? `${req.file.filename}` : null;
  const tanggalPenyerahan = new Date();

  if (!id || !penerima || !gambarBuktiPath) {
    console.error("Input tidak lengkap.");
    return res.status(400).json({ error: "Input tidak lengkap." });
  }

  const transaction = await sequelize.transaction();
  let docxFilePath, pdfFilePath;

  try {
    console.log(`[STEP 1] Validasi dan pencarian data penyerahan`);
    const penyerahan = await Penyerahan.findByPk(id, {
      include: [
        {
          model: Permintaan,
          include: [
            { model: User, attributes: ["nama", "unit_kerja", "jabatan"] },
            { 
              model: Aset, 
              attributes: ["nama_barang", "serial_number", "status_peminjaman"],
              include: [{ model: Kategori, attributes: ["gambar", "nama_kategori"] }] // Pastikan ini diambil
            },
          ],
        },
      ],
      transaction,
    });

    if (!penyerahan) {
      throw new Error("Data penyerahan tidak ditemukan.");
    }

    console.log(`[STEP 2] Memperbarui data penyerahan`);
    await penyerahan.update(
      {
        penerima,
        gambar_bukti: gambarBuktiPath,
        status_penyerahan: "sudah diserahkan",
        tanggal_penyerahan: tanggalPenyerahan,
      },
      { transaction }
    );

    console.log(`[STEP 3] Generate surat berdasarkan template DOCX`);
    const templatePath = path.resolve(__dirname, "../public/templates/template-penyerahan.docx");
    if (!fs.existsSync(templatePath)) {
      console.error(`File template tidak ditemukan di: ${templatePath}`);
      throw new Error("File template tidak ditemukan.");
    }

    const content = fs.readFileSync(templatePath);
    const zip = new PizZip(content);

    const imageOpts = {
      centered: false,
      getImage: (tagValue) => fs.readFileSync(tagValue),
      getSize: () => [120, 120],
    };

    // Ambil path tanda tangan
    const tandaTanganFilename = penyerahan.tanda_tangan;
    const tandaTanganPath = tandaTanganFilename
      ? path.resolve(__dirname, `../public/uploads/${tandaTanganFilename}`)
      : null;

    if (tandaTanganPath && !fs.existsSync(tandaTanganPath)) {
      console.error(`Tanda tangan tidak ditemukan di: ${tandaTanganPath}`);
      throw new Error("Tanda tangan tidak ditemukan.");
    }

    // Ambil path gambar bukti
    const gambarBuktiFilename = penyerahan.gambar_bukti;
    const gambarBuktiFilePath = gambarBuktiFilename
      ? path.resolve(__dirname, `../public/uploads/${gambarBuktiFilename}`)
      : null;

    if (gambarBuktiFilePath && !fs.existsSync(gambarBuktiFilePath)) {
      console.warn(`Gambar bukti tidak ditemukan di: ${gambarBuktiFilePath}`);
    }

    // Ambil path gambar kategori
    const kategoriGambarFilename = penyerahan.Permintaan?.Aset?.Kategori?.gambar;
    const kategoriGambarPath = kategoriGambarFilename
      ? path.resolve(__dirname, `../public/uploads/${kategoriGambarFilename}`)
      : null;

    if (kategoriGambarPath && !fs.existsSync(kategoriGambarPath)) {
      console.warn(`Gambar kategori tidak ditemukan di: ${kategoriGambarPath}`);
    }

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      modules: [new ImageModule(imageOpts)],
    });

    await doc.renderAsync({
      tanggal_penyerahan: penyerahan.tanggal_penyerahan
        ? penyerahan.tanggal_penyerahan.toLocaleDateString("id-ID")
        : "-",
      nama_penerima: penyerahan.penerima || "-",
      tanda_tangan: tandaTanganPath || "", // Menghindari error jika null
      nama: penyerahan.Permintaan?.User?.nama || "-",
      jabatan : penyerahan.Permintaan?.User?.jabatan || "-",
      unit_kerja: penyerahan.Permintaan?.User?.unit_kerja || "-",
      nama_barang: penyerahan.Permintaan?.Aset?.nama_barang || "-",
      serial_number: penyerahan.Permintaan?.Aset?.serial_number || "-",
      kategori : penyerahan.Permintaan?.Aset?.Kategori?.nama_kategori || "-",
      gambar: kategoriGambarPath || "",
      gambar_bukti: gambarBuktiFilePath || "",
    });

    const suratDir = path.resolve(__dirname, "../public/data/surat");
    if (!fs.existsSync(suratDir)) {
      fs.mkdirSync(suratDir, { recursive: true });
    }

    docxFilePath = path.join(suratDir, `${Date.now()}-penyerahan.docx`);
    fs.writeFileSync(docxFilePath, doc.getZip().generate({ type: "nodebuffer" }));

    pdfFilePath = docxFilePath.replace(".docx", ".pdf");

    await new Promise((resolve, reject) => {
      libre.convert(fs.readFileSync(docxFilePath), ".pdf", undefined, (err, result) => {
        if (err) {
          return reject(new Error("Gagal mengonversi DOCX ke PDF"));
        }
        fs.writeFileSync(pdfFilePath, result);
        resolve();
      });
    });

    console.log(`[STEP 5] Menyimpan surat dalam database "penyerahans"`);
    await penyerahan.update({ surat: path.basename(pdfFilePath) }, { transaction });

    console.log(`[STEP 6] Memperbarui status peminjaman aset`);
    if (penyerahan.Permintaan?.Aset) {
      await Aset.update(
        { status_peminjaman: "dipinjam" },
        { where: { serial_number: penyerahan.Permintaan.Aset.serial_number }, transaction }
      );
    }

    console.log(`Update Penyerahan Selesai`);
    res.status(200).json({ message: "Aset berhasil diserahkan dan surat telah digenerate.", pdfFilePath });
    await transaction.commit();
    fs.unlinkSync(docxFilePath);
  } catch (error) {
    console.error(`[ERROR] Terjadi kesalahan:`, error.message);
    await transaction.rollback();

    if (gambarBuktiPath && fs.existsSync(gambarBuktiPath)) fs.unlinkSync(gambarBuktiPath);
    if (docxFilePath && fs.existsSync(docxFilePath)) fs.unlinkSync(docxFilePath);
    if (pdfFilePath && fs.existsSync(pdfFilePath)) fs.unlinkSync(pdfFilePath);

    res.status(500).json({ error: error.message });
  }
};


module.exports = { getPenyerahan , updatePenyerahan};
