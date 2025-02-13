const path = require("path");
const fs = require("fs");
const { Aset, Kategori } = require("../models");
const { title } = require("process");

const tambahKategori = async (req, res) => {
  try {
    const { namaKategori, deskripsi } = req.body;

    // Menangani gambar yang telah diunggah
    const gambar = req.file ? `${req.file.filename}` : null;

    // Validasi input
    if (!namaKategori || !deskripsi || !gambar) {
      return res.status(400).json({ message: "Semua data harus diisi!" });
    }

    await Kategori.create({
      nama_kategori: namaKategori,
      deskripsi,
      gambar: gambar,
    });

    return res.redirect("/admin/pengelolaan-aset");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

  const tampilkanKategori = async (req, res) => {
      try {
        const daftarKategori = await Kategori.findAll({
          include: [{
            model: Aset,
            attributes: ['kondisi_aset']
          }]
        });
    
        const kategoriWithStats = daftarKategori.map(kategori => {
          const asetCount = kategori.Asets.length;
          const kondisiStats = {
            baik: kategori.Asets.filter(aset => aset.kondisi_aset === 'baik').length,
            rusak: kategori.Asets.filter(aset => ['rusak ringan', 'rusak berat'].includes(aset.kondisi_aset)).length
          };
          
          return {
            ...kategori.toJSON(),
            asetCount,
            kondisiStats
          };
        });

        const  title = "Pengelolaan Aset"
    
        res.render("admin/pengelolaanAset/listKategoriAset", {
          req: req,
          kategori: kategoriWithStats,
          title
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
      }
    };

// GET: Menampilkan modal edit dengan data kategori
const tampilkanEditKategori = async (req, res) => {
  try {
    const { id } = req.params;

    // Temukan kategori berdasarkan ID
    const kategori = await Kategori.findByPk(id);

    if (!kategori) {
      return res.status(404).json({ message: "Kategori tidak ditemukan!" });
    }

    res.render("admin/pengelolaanAset/editKategoriAset", {
      kategori, // Mengirim data ke EJS
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

// POST: Memproses perubahan data kategori
const editKategori = async (req, res) => {
  try {
    const { id } = req.params; // Ambil ID dari parameter URL
    const { namaKategori, deskripsi } = req.body; // Ambil data dari body
    const gambar = req.file ? req.file.filename : null; // Ambil gambar jika ada

    console.log("Data yang diterima untuk edit kategori:", {
      id,
      namaKategori,
      deskripsi,
      gambar,
    });

    // Validasi input
    if (!namaKategori || !deskripsi) {
      return res
        .status(400)
        .json({ message: "Nama kategori dan deskripsi harus diisi!" });
    }

    // Cari kategori di database
    const kategori = await Kategori.findByPk(id);
    if (!kategori) {
      return res.status(404).json({ message: "Kategori tidak ditemukan!" });
    }

    // Perbarui data kategori
    kategori.nama_kategori = namaKategori;
    kategori.deskripsi = deskripsi;

    // Proses gambar
    if (gambar) {
      const oldImagePath = path.join(__dirname, "../uploads/", kategori.gambar);
      if (kategori.gambar && fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      kategori.gambar = gambar;
    }

    await kategori.save();
    console.log(`Kategori dengan ID ${id} berhasil diperbarui.`);
    res.redirect("/admin/pengelolaan-aset");
  } catch (error) {
    console.error("Terjadi kesalahan saat mengedit kategori:", error.message);
    console.error("Error stack trace:", error.stack);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

const hapusKategori = async (req, res) => {
  try {
    const { id } = req.params;
    const kategori = await Kategori.findByPk(id);

    if (!kategori) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }

    // Cek apakah ada aset yang status peminjamannya bukan "tersedia"
    const asetTidakTersedia = await Aset.findOne({
      where: { 
        kategoriId: id,
        status_peminjaman: { [Op.ne]: 'tersedia' } // Op.ne = not equal
      }
    });

    if (asetTidakTersedia) {
      return res.status(400).json({ 
        message: "Kategori tidak dapat dihapus karena terdapat aset yang sedang dipinjam atau tidak tersedia." 
      });
    }

    // Hapus semua aset yang terkait dengan kategori
    await Aset.destroy({
      where: { kategoriId: id },
    });

    // Hapus file gambar jika ada
    if (kategori.gambar) {
      const imagePath = path.join(__dirname, "../uploads/", kategori.gambar);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await kategori.destroy();
    res.json({ message: "Kategori berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Kategori tidak dapat dihapus karena terdapat aset yang sedang dipinjam atau tidak tersedia." });
  }
};

const tampilkanAsetBerdasarkanKategori = async (req, res) => {
  try {
    const { id } = req.params; // Ambil ID kategori dari parameter URL
    const kategori = await Kategori.findByPk(id); // Temukan kategori berdasarkan ID

    if (!kategori) {
      return res.status(404).json({ message: "Kategori tidak ditemukan!" });
    }

    const aset = await Aset.findAll({
      where: { kategoriId: id }, // Ambil aset berdasarkan kategoriId
    });
    const  title = "Pengelolaan Aset"

    res.render("admin/pengelolaanAset/listAset", {
      req: req,
      kategori: kategori,
      aset: aset, // Kirim data aset ke EJS
      title
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

const tambahAset = async (req, res) => {
  try {
    const {
      serialNumber,
      hostname,
      namaAset,
      ipAddress,
      caraDapat,
      kategoriId,
    } = req.body;

    // Cek apakah serial number sudah ada di database
    const existingAset = await Aset.findOne({ where: { serial_number: serialNumber } });

    if (existingAset) {
      return res.status(400).json({
        success: false,
        message: `Tidak dapat menambah aset karena aset dengan serial number ${serialNumber} sudah ada.`,
        isSerialExist: true // Flag khusus untuk menandai error serial number exist
      });
    }

    // Jika tidak ada, buat aset baru
    await Aset.create({
      serial_number: serialNumber,
      hostname,
      nama_barang: namaAset,
      ip_address: ipAddress,
      cara_dapat: caraDapat,
      kondisi_aset: "baik",            
      status_peminjaman: "tersedia",   
      kategoriId,
    });

    res.status(200).json({
      success: true,
      redirectUrl: `/admin/list-aset/${kategoriId}`
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



const tampilkanEditAset = async (req, res) => {
    try {
        const { serialNumber } = req.params;
        console.log('Fetching asset with serial number:', serialNumber);
        
        const aset = await Aset.findByPk(serialNumber, {
            include: [{
                model: Kategori,
                attributes: ['id', 'nama_kategori']
            }]
        });
        
        console.log('Found asset:', aset);

        if (!aset) {
            return res.status(404).json({ message: 'Aset tidak ditemukan' });
        }

        res.json(aset);
    } catch (error) {
        console.error('Error fetching asset:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

const editAset = async (req, res) => {
  try {
      const { serialNumber } = req.params;
      const { hostname, namaAset, ipAddress, caraDapat, kondisiAset, statusPinjam } = req.body;

      const aset = await Aset.findByPk(serialNumber);
      if (!aset) {
          return res.status(404).json({ message: 'Aset tidak ditemukan' });
      }

      await aset.update({
          hostname,
          nama_barang: namaAset,
          ip_address: ipAddress,
          cara_dapat: caraDapat,
          kondisi_aset: (aset.status_peminjaman === 'dipinjam' || aset.status_peminjaman === 'sedang diajukan') 
            ? aset.kondisi_aset 
            : kondisiAset,
          status_peminjaman: statusPinjam || aset.status_peminjaman,
      });

      res.redirect(`/admin/list-aset/${aset.kategoriId}`);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Gagal mengupdate aset' });
  }
};


const hapusAset = async (req, res) => {
    try {
        const { serialNumber } = req.params;
        const aset = await Aset.findByPk(serialNumber);
        
        if (!aset) {
            return res.status(404).json({ message: 'Aset tidak ditemukan' });
        }

        const kategoriId = aset.kategoriId;
        await aset.destroy();
        
        return res.json({ 
            success: true, 
            message: 'Aset berhasil dihapus',
            redirectUrl: `/admin/list-aset/${kategoriId}`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal menghapus aset' });
    }
};

const tampilkanDetailAset = async (req, res) => {
    try {
        const { id: serialNumber } = req.params;
        
        const aset = await Aset.findByPk(serialNumber, {
            include: [{
                model: Kategori,
                attributes: ['id', 'nama_kategori', 'gambar']
            }]
        });

        if (!aset) {
            return res.status(404).json({ message: "Aset tidak ditemukan!" });
        }

        const  title = "Pengelolaan Aset"

        res.render("admin/pengelolaanAset/detailAset", {
            req: req,
            aset: aset,
            kategori: aset.Kategori,
            title
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

const tampilkanDaftarAsetKaryawan = async (req, res) => {
  try {
    const kategoris = await Kategori.findAll({
      include: [{
        model: Aset,
        where: {
          kondisi_aset: 'baik',
          status_peminjaman: 'tersedia'
        },
        required: true, // Changed to false to get all categories
        attributes: ['serial_number']
      }],
      attributes: ['id', 'nama_kategori', 'deskripsi', 'gambar'],
      group: ['Kategori.id']
    });

    const formattedKategoris = await Promise.all(kategoris.map(async (kategori) => {
      const stockCount = await Aset.count({
        where: {
          kategoriId: kategori.id,
          kondisi_aset: 'baik',
          status_peminjaman: 'tersedia'
        }
      });

      return {
        id: kategori.id,
        title: kategori.nama_kategori,
        description: kategori.deskripsi,
        image: `/uploads/${kategori.gambar}`,
        stock: stockCount,
        serial_number: kategori.Asets[0].serial_number
      };
    }));

    const title = "Daftar Aset"
    res.render('karyawan/daftarAset/daftar-aset', {
      assets: formattedKategoris,
      req: req,
      currentPath: req.path,
      title
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data aset' });
  }
};

const tampilkanDetailAsetKaryawan = async (req, res) => {
  try {
    const { id } = req.params;
    const kategori = await Kategori.findOne({
      where: { id },
      include: [{
        model: Aset,
        where: {
          kondisi_aset: 'baik',
          status_peminjaman: 'tersedia'
        },
        attributes: ['nama_barang', 'serial_number']
      }],
      attributes: ['nama_kategori', 'deskripsi', 'gambar']
    });
 
    if (!kategori) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }

    const title = "Daftar Aset"
 
    res.render('karyawan/daftarAset/detail-aset', {
      kategori: {
        nama_barang: kategori.Asets[0].nama_barang,
        nama_kategori: kategori.nama_kategori,
        deskripsi: kategori.deskripsi,
        title: kategori.nama_kategori,
        gambar: `/uploads/${kategori.gambar}`,
        serial_number: kategori.Asets[0].serial_number
      },
      currentPath: req.path,
      req,
      title
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan' });
  }
 };
 

module.exports = {
  tambahKategori,
  tampilkanKategori,
  tampilkanEditKategori,
  editKategori,
  tampilkanAsetBerdasarkanKategori,
  tambahAset,
  editAset,
  hapusKategori,
  tampilkanEditAset,
  hapusAset,
  tampilkanDetailAset,
  tampilkanDaftarAsetKaryawan,
  tampilkanDetailAsetKaryawan,
};
