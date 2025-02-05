const express = require('express');
const { where } = require('sequelize');
const {Penyerahan, Permintaan, PengajuanCek, Kategori, Aset, PengembalianVendor, User, Sequelize } = require('../models');



const getReturnKaryawan = async (req, res) => {
  try {
    const vendorSubmissions = await PengembalianVendor.findAll({
      where : { status_pengembalian : 'belum dikembalikan',
         cek_id: { [Sequelize.Op.ne]: null } 
      },
      include : [
        {
          model : PengajuanCek,
          include : [
            {
              model : Penyerahan,
              include : [
                {
                  model : Permintaan,
                  include : [
                    {
                      model : Aset,
                      where: { cara_dapat: 'sewa'},
                      attributes : ['serial_number', 'nama_barang'],
                      include : [
                        {
                          model : Kategori,
                          attributes : ['gambar']
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
    })  

    console.log(vendorSubmissions)

    res.render('admin/pengembalianVendor/asetKaryawan', { vendorSubmissions: vendorSubmissions  });

    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

//menampilkan detail aset karyawan dihalaman pengembalian vendor
const getDetailAsetKaryawanVendor = async (req, res) => {
  const { id } = req.params; // Mengambil ID aset dari parameter URL

  try {
      // Ambil detail aset berdasarkan ID dengan relasi yang relevan
      const detailAset = await PengembalianVendor.findOne({
          where: { id },
          include: [
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
                                          attributes: ['serial_number', 'nama_barang', 'kondisi_aset', 'hostname'],
                                          include: [
                                              {
                                                  model: Kategori,
                                                  attributes: ['nama_kategori', 'gambar', 'deskripsi']
                                              }
                                          ]
                                      }, 
                                      {
                                        model : User, 
                                        atrributes : ['nama']
                                      }
                                  ]
                              }
                          ]
                      }
                  ]
              }
          ]
      });

      // Jika detail aset tidak ditemukan, tampilkan halaman error
      if (!detailAset) {
          return res.status(404).render('errorPage', { message: 'Detail aset karyawan vendor tidak ditemukan.' });
      }

      // Render halaman detail aset karyawan vendor
      res.render('admin/pengembalianVendor/detailAsetKaryawan', { detailAset });

  } catch (error) {
      console.error('Error saat mengambil detail aset karyawan vendor:', error);
      res.status(500).json({ message: 'Gagal memuat detail aset karyawan vendor', error: error.message });
  }
};

const updateStatusVendorKaryawan = async (req, res) => {
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


const updateStatusPengembalianKaryawan = async (req, res) => { 
  try { 
      const { id } = req.params; 
      console.log("Processing request for ID:", id); 
       
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

      // Update pengembalian status
      pengembalian.status_pengembalian = 'sudah dikembalikan'; 
      await pengembalian.save(); 
      console.log("Status updated successfully"); 

      // Update pengajuan status
      const pengajuan = await PengajuanCek.findOne({ where: { id: pengembalian.cekId },
      include : [
        {
          model : Penyerahan,
          include : [{
            model : Permintaan,
            include : [{
              model : Aset,
              atrributes : ['serial_number', 'kondisi_aset']
            }]
          }]
        }
      ] },
      ); 
      if (pengajuan) { 
          pengajuan.status_cek = 'sudah diperbaiki' 
          pengajuan.status_pengembalian = 'sudah'; 
          await pengajuan.save(); 
          console.log("Status pengajuan updated successfully"); 
      } else { 
          console.log("No related PengajuanCek found for this PengembalianVendor"); 
      }

      // Update kondisi aset
      const aset = await Aset.findOne({ 
          where: { serial_number: pengajuan.Penyerahan.Permintaan.Aset.serial_number }
      });
      
      if (aset) {
          aset.kondisi_aset = 'baik';
          await aset.save();
          console.log("Kondisi aset updated successfully");
      } else {
          console.log("No related Aset found for this serial number");
      }
       
      res.json({              
          success: true,  
          message: "Status pengembalian dan kondisi aset berhasil diperbarui"
      }); 

  } catch (error) { 
      console.error(error); 
      res.status(500).json({ message: "Terjadi kesalahan dalam proses pengembalian" }); 
  } 
};

module.exports = { 
  getReturnKaryawan,
  getDetailAsetKaryawanVendor,
  updateStatusVendorKaryawan,
  updateStatusPengembalianKaryawan 
 };
