const express = require('express');
const { Pengembalian, Penyerahan, Permintaan, Aset, User, PengajuanCek, Kategori } = require('../models');
const { where } = require('sequelize');

const getPeminjaman = async (req, res) => {
    try {
        const currentPath = req.path;
        const userId = req.userId;

        const listPeminjaman = await Penyerahan.findAll({
            include: [
                {
                    model: Permintaan,
                    where: { userId }, // Filter berdasarkan userId di tabel Permintaan
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
                        }
                    ]                    
                }
            ],
            where: { status_penyerahan: 'sudah diserahkan' } // Pastikan hanya yang sudah diserahkan
        });

        return res.render('karyawan/peminjaman/peminjamanAset', { listPeminjaman, currentPath });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan dalam mengambil data peminjaman' });
    }
};

//button ajukan cek
const createPengajuanCek = async (req, res) => {
    try {
        const { penyerahanId } = req.params;
        const { keluhan} = req.body;
        await PengajuanCek.create({
            keluhan,
            status_cek: 'sedang diproses',
            tanggal_pengecekan : new Date(),
            penyerahanId,
            status_pengembalian : 'belum    '
        })

        return res.redirect('/karyawan/peminjamanAset')
    } catch (error) {
        console.error(error);
        console.log(error)
        return res.status(500).json({ message: 'Terjadi kesalahan saat membuat pengajuan cek' });
    }
};

//menampilkan laporan cek
const getAllDataLaporancek = async (req, res) => {
    try {
        
        const userId = req.userId;
        // Fetch all data with nested relationships
        const laporanCekList = await PengajuanCek.findAll({
            include: [
                {
                    model: Penyerahan,
                    required: true,
                    include: [
                        {
                            model: Permintaan,
                            required: true,
                            where : {userId},
                            include: [
                                {
                                    model: Aset,
                                    required: true,
                                    attributes: ['serial_number', 'nama_barang'], // Adjust attribute name if needed
                                    include: [
                                        {
                                            model: Kategori,
                                            required: true,
                                            attributes: ['gambar'], // Include category image
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
            order: [['tanggal_pengecekan', 'DESC']] // Urutkan berdasarkan tanggal pengecekan terbaru
        });

         // Format tanggal menggunakan Intl
        //  const formattedData = laporanCekList.map((item) => ({
        //     ...item.dataValues,
        //     tanggal_pengecekan: item.tanggal_pengecekan
        //         ? new Intl.DateTimeFormat('id-ID', {
        //               day: '2-digit',
        //               month: '2-digit',
        //               year: 'numeric',
        //           }).format(new Date(item.tanggal_pengecekan))
        //         : '-', // Handle if date is null
        // }));

        // Render view dengan data yang sudah diformat
        res.render('karyawan/peminjaman/laporanCek', { laporanCekList, currentPath: req.path });
    } catch (error) {
        // Log and handle errors
        console.error('Error fetching laporan cek:', error);

        res.status(500).json({
            message: 'Terjadi kesalahan saat mengambil data laporan cek.',
            error: error.message,
        });
    }
};



module.exports = {
    getPeminjaman,
    createPengajuanCek,
    getAllDataLaporancek,
};