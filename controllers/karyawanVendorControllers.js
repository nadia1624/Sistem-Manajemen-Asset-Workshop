const express = require('express');
const { where } = require('sequelize');
const {Penyerahan, Permintaan, PengajuanCek, Kategori, Aset, PengembalianVendor, User } = require('../models');


// const getReturnKaryawan = async (req, res) => {
//   try {
//     // Ambil data pengajuan cek dengan status "diajukan ke vendor"
//     const vendorSubmissions = await PengajuanCek.findAll({
//       where: { status_cek: 'diajukan ke vendor' },
//       attributes: ['id', 'tanggal_pengecekan'],
//       include: [
//         {
//             model: Penyerahan,
//             include: [
//                 {
//                     model: Permintaan,
//                     include: [
//                         {
//                             model: Aset,
//                             attributes: ['serial_number', 'nama_barang'],
//                             include: [
//                                 {
//                                     model: Kategori,
//                                     attributes: ['gambar']
//                                 }
//                             ]
//                         }
//                     ]                            
//                 }
//             ]
//         }
//     ],
//     });

//     // Ambil serial_number dari aset
//     const serialNumbers = vendorSubmissions.flatMap((submission) =>
//       submission.Penyerahan?.Permintaan?.Aset?.serial_number || []
//     );

//     // Ambil data pengembalian vendor berdasarkan serial_number aset
//     const returnedItems = await PengembalianVendor.findAll({
//       where: {
//         serial_number: serialNumbers, // Gunakan serial_number dari aset
//       },
//       attributes: ['id', 'status_admin', ],
//       include: [
//         {
//           model: PengajuanCek,
//           where: { status_cek: 'diajukan ke vendor' },
//           attributes: ['id'],
//           include: [
//             {
//               model: Kategori,
//               attributes: ['nama_kategori', 'gambar', 'deskripsi'],
//             },
//           ],
//         },
//       ],
//     });


//     // Render halaman aset karyawan dengan data yang didapat
//     res.render('admin/pengembalianVendor/asetKaryawan', { vendorSubmissions, returnedItems });
//   } catch (error) {
//     // Tampilkan error jika terjadi kesalahan
//     res.status(500).json({ message: error.message });
//   }
// };

const getReturnKaryawan = async (req, res) => {
  try {
    const vendorSubmissions = await PengembalianVendor.findAll({
      include : [
        {
          model : PengajuanCek,
          where: { status_cek: 'diajukan ke vendor' },
          include : [
            {
              model : Penyerahan,
              include : [
                {
                  model : Permintaan,
                  include : [
                    {
                      model : Aset,
                      atrributes : ['serial_number', 'nama_barang'],
                      include : [
                        {
                          model : Kategori,
                          atrributes : ['gambar']
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
      
    })

    res.render('admin/pengembalianVendor/asetKaryawan', { vendorSubmissions });

    
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
                                          attributes: ['serial_number', 'nama_barang'],
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

module.exports = { 
  getReturnKaryawan,
  getDetailAsetKaryawanVendor,
 };
