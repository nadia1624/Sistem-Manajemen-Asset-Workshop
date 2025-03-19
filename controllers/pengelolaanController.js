const path = require("path");
const fs = require("fs");
const { Aset, Kategori } = require("../models");
const { title } = require("process");
const { Op } = require("sequelize");

const tambahKategori = async (req, res) => {
  try {
    const { namaKategori, deskripsi } = req.body;

    const gambar = req.file ? `${req.file.filename}` : null;

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

const tampilkanEditKategori = async (req, res) => {
  try {
    const { id } = req.params;

    const kategori = await Kategori.findByPk(id);

    if (!kategori) {
      return res.status(404).json({ message: "Kategori tidak ditemukan!" });
    }

    res.render("admin/pengelolaanAset/editKategoriAset", {
      kategori, 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

const editKategori = async (req, res) => {
  try {
    const { id } = req.params;
    const { namaKategori, deskripsi } = req.body;
    const gambar = req.file ? req.file.filename : null;

    console.log("Data yang diterima untuk edit kategori:", {
      id,
      namaKategori,
      deskripsi,
      gambar,
    });

    if (!namaKategori || !deskripsi) {
      return res
        .status(400)
        .json({ message: "Nama kategori dan deskripsi harus diisi!" });
    }

    const kategori = await Kategori.findByPk(id);
    if (!kategori) {
      return res.status(404).json({ message: "Kategori tidak ditemukan!" });
    }

    kategori.nama_kategori = namaKategori;
    kategori.deskripsi = deskripsi;

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

    const jumlahAset = await Aset.count({
      where: { kategoriId: id }
    });

    if (jumlahAset === 0) {
      if (kategori.gambar) {
        const imagePath = path.join(__dirname, "../uploads/", kategori.gambar);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      await kategori.destroy();
      return res.json({ 
        success: true,
        message: "Kategori berhasil dihapus karena tidak memiliki aset" 
      });
    }

    const asetDenganStatusLain = await Aset.count({
      where: { 
        kategoriId: id,
        status_peminjaman: { [Op.ne]: 'tersedia' }
      }
    });

    if (asetDenganStatusLain > 0) {
      return res.status(400).json({ 
        success: false,

        message: "Kategori tidak dapat dihapus karena terdapat aset yang sedang dipinjam atau tidak tersedia.",
        
        asetTidakTersedia: asetDenganStatusLain
      });
    }

    await Aset.destroy({
      where: { kategoriId: id }
    });

    if (kategori.gambar) {
      const imagePath = path.join(__dirname, "../uploads/", kategori.gambar);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await kategori.destroy();
    
    return res.json({ 
      success: true,
      message: "Kategori dan semua aset berhasil dihapus"
    });

  } catch (error) {
    console.error('Error saat menghapus kategori:', error);
    return res.status(500).json({ 
      success: false,
      message: "Terjadi kesalahan saat menghapus kategori",
      error: error.message 
    });
  }
};

const tampilkanAsetBerdasarkanKategori = async (req, res) => {
  try {
    const { id } = req.params; 
    const kategori = await Kategori.findByPk(id); 

    if (!kategori) {
      return res.status(404).json({ message: "Kategori tidak ditemukan!" });
    }

    const aset = await Aset.findAll({
      where: { kategoriId: id },
    });
    const  title = "Pengelolaan Aset"

    res.render("admin/pengelolaanAset/listAset", {
      req: req,
      kategori: kategori,
      aset: aset,
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

    const existingAset = await Aset.findOne({ where: { serial_number: serialNumber } });

    if (existingAset) {
      return res.status(400).json({
        success: false,
        message: `Tidak dapat menambah aset karena aset dengan serial number ${serialNumber} sudah ada.`,
        isSerialExist: true 
      });
    }

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
      message: 'Aset berhasil ditambah!',
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
    const { serialNumber: newSerialNumber, hostname, namaAset, ipAddress, caraDapat, kondisiAset, statusPinjam } = req.body;

    const aset = await Aset.findByPk(serialNumber);
    if (!aset) {
      return res.status(404).json({ success: false, message: 'Aset tidak ditemukan' });
    }

    if (serialNumber !== newSerialNumber) {
      const existingAset = await Aset.findByPk(newSerialNumber);
      if (existingAset) {
        return res.status(400).json({ 
          success: false, 
          message: 'Serial number tidak dapat diedit karena sudah dimiliki oleh aset lain'
        });
      }

      try {
        const kategoriId = aset.kategoriId;

        const newAset = await Aset.create({
          serial_number: newSerialNumber,
          hostname,
          nama_barang: namaAset,
          ip_address: ipAddress,
          cara_dapat: caraDapat,
          kondisi_aset: (aset.status_peminjaman === 'dipinjam' || aset.status_peminjaman === 'sedang diajukan') 
            ? aset.kondisi_aset 
            : kondisiAset,
          status_peminjaman: statusPinjam || aset.status_peminjaman,
          kategoriId: kategoriId,
        });

        await aset.destroy();
        
        return res.json({ 
          success: true, 
          message: 'Aset berhasil diperbarui!', 
          redirectUrl: `/admin/list-aset/${kategoriId}`
        });
      } catch (error) {
        console.error("Error updating asset with new serial number:", error);
        return res.status(500).json({ 
          success: false, 
          message: 'Gagal mengupdate aset: ' + (error.message || 'Error tidak diketahui')
        });
      }
    } else {
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
      
      return res.json({ 
        success: true, 
        message: 'Aset berhasil diperbarui!', 
        redirectUrl: `/admin/list-aset/${aset.kategoriId}`
      });
    }
  } catch (error) {
    console.error("General error in editAset:", error);
    return res.status(500).json({ 
      success: false, 
      message: 'Gagal mengupdate aset: ' + (error.message || 'Error tidak diketahui')
    });
  }
};


const hapusAset = async (req, res) => {
  try {
      const { serialNumber } = req.params;
      const aset = await Aset.findByPk(serialNumber);

      if (!aset) {
          return res.status(404).json({ success: false, message: 'Aset tidak ditemukan' });
      }

      if (aset.status_peminjaman !== 'tersedia') {
          return res.json({ 
              success: false, 
              message: 'Aset tidak dapat dihapus karena sedang dipinjam atau tidak tersedia.', 
              status_peminjaman: aset.status_peminjaman 
          });
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
      res.status(500).json({ success: false, message: 'Gagal menghapus aset' });
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
        required: true,
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

      const formattedDescription = kategori.deskripsi
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');

      return {
        id: kategori.id,
        title: kategori.nama_kategori,
        description: formattedDescription,
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
