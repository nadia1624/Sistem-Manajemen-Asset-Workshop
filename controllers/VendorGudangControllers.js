const express = require('express');
const PengembalianVendor = require('../models/pengembalianVendor');
const Aset = require('../models/aset');
const Kategori = require('../models/kategori');

const getReturnGudang = async (req, res) => {
    try {
        const returnGudang = await PengembalianVendor.findAll({
            include: [
                {
                    model: Aset,
                    where: { kondisi_aset: "rusak berat", cara_dapat: "sewa" }, 
                    attributes: ["serial_number", "nama_barang"],
                    include: [
                        {
                            model: Kategori,
                            attributes: ["gambar"], 
                        }
                    ]
                }
            ],
        });
        
        res.render('admin/pengembalianVendor/asetGudang', { returnGudang });

    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Error fetching data");
    }
}

const getRiwayatPengembalianVendor = async (req, res) => {
  try {
      const pengembalian = await PengembalianVendor.findAll({
          where: { status_admin: 'selesai' },
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


module.exports = { getReturnGudang, getRiwayatPengembalianVendor, getDetailVendorGudang, getDetailRiwayatVendor };
