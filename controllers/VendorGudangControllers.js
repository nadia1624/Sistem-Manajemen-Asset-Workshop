const express = require('express');
const PengembalianVendor = require('../models/pengembalianVendor');
const Aset = require('../models/aset');
const Kategori = require('../models/kategori');
const DetailPemeliharaan = require('../models/detailPemeliharaan')

const getReturnGudang = async (req, res) => {
    try {
        // Ambil aset dengan kondisi rusak berat, sewa, dan tersedia
        const asetRusakBerat = await Aset.findAll({
            where: { kondisi_aset: "rusak berat", cara_dapat: "sewa", status_peminjaman: "tersedia" },
            attributes: ["serial_number", "nama_barang"]
        });

        // Ambil serial number yang sudah ada di PengembalianVendor
        const existingEntries = await PengembalianVendor.findAll({
            where: { serial_number: asetRusakBerat.map(aset => aset.serial_number) },
            attributes: ["serial_number"]
        });
        
        const existingSerials = new Set(existingEntries.map(entry => entry.serial_number));

        // Filter aset yang belum ada di PengembalianVendor
        const newEntries = asetRusakBerat.filter(aset => !existingSerials.has(aset.serial_number))
            .map(aset => ({
                serial_number: aset.serial_number,
                status_admin: "belum diproses",
                status_pengembalian: "belum dikembalikan",
                cekId: null
            }));

        // Masukkan data baru jika ada
        if (newEntries.length > 0) {
            await PengembalianVendor.bulkCreate(newEntries);
            console.log(`${newEntries.length} aset otomatis masuk ke PengembalianVendor`);
        }

        // Ambil data untuk ditampilkan
        const returnGudang = await PengembalianVendor.findAll({
            include: [{
                model: Aset,
                where: { kondisi_aset: "rusak berat", cara_dapat: "sewa", status_peminjaman: "tersedia" },
                attributes: ["serial_number", "nama_barang"],
                include: [{
                    model: Kategori,
                    attributes: ["gambar"]
                }]
            }],
            
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
                    },
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
              }
          ]
      });

      if (!pengembalian) {
          return res.status(404).json({ message: "Data pengembalian tidak ditemukan" });
      }

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
          gambar: pengembalian.Aset?.Kategori?.gambar || 'https://placehold.co/150x150'
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

        const pengembalian = await PengembalianVendor.findOne({ where: { id } });
        if (!pengembalian) {
            return res.status(404).json({ message: "Data pengembalian tidak ditemukan" });
        }

        await PengembalianVendor.update({ status_admin }, { where: { id } });

        res.json({ message: "Status pengembalian berhasil diperbarui", status_admin });
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
