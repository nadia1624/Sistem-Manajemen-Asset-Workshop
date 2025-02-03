const express = require('express');
const { PengembalianVendor, Aset, Kategori, PengajuanCek, Penyerahan, Permintaan } = require('../models');

const getReturnGudang = async (req, res) => {
  try {
      // Ambil aset dengan kondisi rusak berat, sewa, dan tersedia
      const asetRusakBerat = await Aset.findAll({
          where: { 
              kondisi_aset: "rusak berat", 
              cara_dapat: "sewa", 
              status_peminjaman: "tersedia" 
          },
          attributes: ["serial_number", "nama_barang"]
      });

      // Generate ID untuk entries baru
      const getNewPengembalianId = async () => {
          const lastEntry = await PengembalianVendor.findOne({
              order: [['id', 'DESC']]
          });

          if (!lastEntry) {
              return 'PV001';
          }

          // Ambil id dan pastikan dalam bentuk string
          const lastId = lastEntry.get('id').toString();
          const lastNumber = parseInt(lastId.substring(2));
          return `PV${String(lastNumber + 1).padStart(3, '0')}`;
      };

      // Cek dan buat entry baru untuk setiap aset rusak berat
      for (const aset of asetRusakBerat) {
          // Cek apakah ada entry yang belum dikembalikan untuk serial number ini
          const existingEntry = await PengembalianVendor.findOne({
              where: {
                  serial_number: aset.serial_number,
                  status_pengembalian: "belum dikembalikan"
              }
          });

          // Jika tidak ada entry yang belum dikembalikan, buat entry baru
          if (!existingEntry) {
              const newId = await getNewPengembalianId();
              await PengembalianVendor.create({
                  id: newId,
                  serial_number: aset.serial_number,
                  status_admin: "belum diproses",
                  status_pengembalian: "belum dikembalikan"
              });
              console.log(`Created new entry ${newId} for serial number ${aset.serial_number}`);
          }
      }

      // Ambil data untuk ditampilkan (hanya yang belum dikembalikan)
      const returnGudang = await PengembalianVendor.findAll({
          where: {
              status_pengembalian: "belum dikembalikan"
          },
          include: [{
              model: Aset,
              where: { 
                  kondisi_aset: "rusak berat", 
                  cara_dapat: "sewa", 
                  status_peminjaman: "tersedia" 
              },
              attributes: ["serial_number", "nama_barang"],
              include: [{
                  model: Kategori,
                  attributes: ["gambar"]
              }]
          }],
          order: [['created_at', 'DESC']]
      });

      res.render('admin/pengembalianVendor/asetGudang', { returnGudang });
  } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Error fetching data");
  }
};

const getRiwayatPengembalianVendor = async (req, res) => {
    try {
      const pengembalian = await PengembalianVendor.findAll({
        where: { status_pengembalian: 'sudah dikembalikan' },
        include: [
          {
            model: Aset,
            attributes: ['serial_number', 'nama_barang'],
            include: [
              {
                model: Kategori,
                attributes: ['gambar', 'deskripsi']
              }
            ]
          },
          {
            model: PengajuanCek,
            attributes: ['status_cek', 'tanggal_pengecekan', 'keluhan'],
            include: [
              {
                model: Penyerahan,
                include: [
                  {
                    model: Permintaan,
                    include: [
                      {
                        model: Aset,
                        attributes: ['serial_number', 'nama_barang'],
                        include: [
                          {
                            model: Kategori,
                            attributes: ['gambar', 'deskripsi']
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']]
      });
  
      res.render('admin/pengembalianVendor/riwayatVendor', { pengembalian });
    } catch (error) {
      console.error("Error fetching riwayat pengembalian:", error);
      res.status(500).send("Terjadi kesalahan dalam mengambil data.");
    }
  };
  
  

const getDetailVendorGudang = async (req, res) => {
  try {
      const { id } = req.params;

      const pengembalian = await PengembalianVendor.findOne({
          where: { id },
          include: [
              {
                  model: Aset,
                  attributes: ['serial_number', 'nama_barang', 'hostname', 'cara_dapat', 'kondisi_aset'],
                  include: [
                      {
                          model: Kategori,
                          attributes: ['nama_kategori', 'gambar', 'deskripsi']
                      }
                  ]
              }
          ]
      });

      if (!pengembalian) {
          return res.status(404).json({ message: "Data pengembalian tidak ditemukan" });
      }

      res.render('admin/pengembalianVendor/detailAsetGudang', {
          title: "Detail Aset Gudang",
          pengembalian: pengembalian,
          serial_number: pengembalian.Aset?.serial_number || '-',
          nama_barang: pengembalian.Aset?.nama_barang || '-',
          hostname: pengembalian.Aset?.hostname || '-',
          cara_dapat: pengembalian.Aset?.cara_dapat || '-',
          kondisi_aset: pengembalian.Aset?.kondisi_aset || '-',
          nama_kategori: pengembalian.Aset?.Kategori?.nama_kategori || '-',
          deskripsi: pengembalian.Aset?.Kategori?.deskripsi || '-',
          gambar: pengembalian.Aset?.Kategori?.gambar || 'https://placehold.co/150x150'
      });

  } catch (error) {
      console.error("Error fetching detail pengembalian:", error);
      res.status(500).json({ message: "Terjadi kesalahan dalam mengambil data." });
  }
};

const getDetailRiwayatVendor = async (req, res) => {
    try {
      const { id } = req.params;
  
      const pengembalian = await PengembalianVendor.findOne({
        where: { id },
        include: [
          {
            model: Aset,
            attributes: ['serial_number', 'nama_barang', 'hostname', 'cara_dapat', 'kondisi_aset'],
            include: [
              {
                model: Kategori,
                attributes: ['nama_kategori', 'gambar', 'deskripsi']
              }
            ]
          },
          {
            model: PengajuanCek,
            include: [
              {
                model: Penyerahan,
                include: [
                  {
                    model: Permintaan,
                    include: [
                      {
                        model: Aset,
                        attributes: ['serial_number', 'nama_barang', 'hostname', 'cara_dapat', 'kondisi_aset'],
                        include: [
                          {
                            model: Kategori,
                            attributes: ['nama_kategori', 'gambar', 'deskripsi']
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      });
  
      if (!pengembalian) {
        return res.status(404).json({ message: "Data pengembalian tidak ditemukan" });
      }

      // Render the detail page without the unnecessary fields
      res.render('admin/pengembalianVendor/detailAsetRiwayat', {
        title: "Detail Riwayat Pengembalian",
        pengembalian: pengembalian,
        serial_number: pengembalian.Aset?.serial_number || '-',
        nama_barang: pengembalian.Aset?.nama_barang || '-',
        hostname: pengembalian.Aset?.hostname || '-',
        cara_dapat: pengembalian.Aset?.cara_dapat || '-',
        kondisi_aset: pengembalian.Aset?.kondisi_aset || '-',
        nama_kategori: pengembalian.Aset?.Kategori?.nama_kategori || '-',
        deskripsi: pengembalian.Aset?.Kategori?.deskripsi || '-',
        gambar: pengembalian.Aset?.Kategori?.gambar || 'https://placehold.co/150x150',
  
        // Nested Aset and Kategori under PengajuanCek (without unnecessary fields)
        aset_pengajuan_serial_number: pengembalian.PengajuanCek?.Penyerahan?.Permintaan?.Aset?.serial_number || '-',
        aset_pengajuan_nama_barang: pengembalian.PengajuanCek?.Penyerahan?.Permintaan?.Aset?.nama_barang || '-',
        aset_pengajuan_hostname: pengembalian.PengajuanCek?.Penyerahan?.Permintaan?.Aset?.hostname || '-',
        aset_pengajuan_cara_dapat: pengembalian.PengajuanCek?.Penyerahan?.Permintaan?.Aset?.cara_dapat || '-',
        aset_pengajuan_kondisi_aset: pengembalian.PengajuanCek?.Penyerahan?.Permintaan?.Aset?.kondisi_aset || '-',
        aset_pengajuan_nama_kategori: pengembalian.PengajuanCek?.Penyerahan?.Permintaan?.Aset?.Kategori?.nama_kategori || '-',
        aset_pengajuan_deskripsi: pengembalian.PengajuanCek?.Penyerahan?.Permintaan?.Aset?.Kategori?.deskripsi || '-',
        aset_pengajuan_gambar: pengembalian.PengajuanCek?.Penyerahan?.Permintaan?.Aset?.Kategori?.gambar || 'https://placehold.co/150x150'
      });
  
    } catch (error) {
      console.error("Error fetching detail pengembalian:", error);
      res.status(500).json({ message: "Terjadi kesalahan dalam mengambil data." });
    }
};

const updateStatusVendorGudang = async (req, res) => {
  try {
      const { id } = req.params;
      const { status_admin } = req.body;

      // Cek dulu data yang akan diupdate
      const pengembalian = await PengembalianVendor.findOne({ 
          where: { 
              id: id,
              status_pengembalian: "belum dikembalikan" // Pastikan hanya update yang belum dikembalikan
          } 
      });

      if (!pengembalian) {
          return res.status(404).json({ message: "Data pengembalian tidak ditemukan" });
      }

      // Update menggunakan instance yang sudah ditemukan
      pengembalian.status_admin = status_admin;
      await pengembalian.save();

      // Kirim response dengan data yang sudah diupdate
      res.json({ 
          message: "Status pengembalian berhasil diperbarui", 
          status_admin: pengembalian.status_admin,
          id: pengembalian.id 
      });

  } catch (error) {
      console.error("Error updating status:", error);
      res.status(500).json({ message: "Terjadi kesalahan dalam memperbarui status." });
  }
};

const updateStatusPengembalian = async (req, res) => {
    try {
        const { id } = req.params;

        const pengembalian = await PengembalianVendor.findByPk(id);
        if (!pengembalian) {
            return res.status(404).json({ message: "Data tidak ditemukan" });
        }

        if (pengembalian.status_pengembalian === 'sudah dikembalikan') {
            return res.status(400).json({ message: "Aset sudah dikembalikan" });
        }

        if (pengembalian.status_admin !== 'selesai') {
            return res.status(400).json({ message: "Status admin belum selesai, tidak dapat melakukan pengembalian" });
        }

        pengembalian.status_pengembalian = 'sudah dikembalikan';
        await pengembalian.save();

        const aset = await Aset.findOne({ where: { serial_number: pengembalian.serial_number } });
        if (aset) {
            aset.kondisi_aset = 'baik';
            await aset.save();
        }

        res.status(200).json({ message: "Status pengembalian berhasil diperbarui", pengembalian });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan dalam proses pengembalian" });
    }
};




module.exports = { 
    getReturnGudang, 
    getRiwayatPengembalianVendor, 
    getDetailVendorGudang, 
    getDetailRiwayatVendor,
    updateStatusVendorGudang,
    updateStatusPengembalian
};
