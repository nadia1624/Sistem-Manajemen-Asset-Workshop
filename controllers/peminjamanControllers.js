const express = require('express');
const { Pengembalian, Penyerahan, Permintaan, Aset, User, PengajuanCek } = require('../models');
const { where } = require('sequelize');
const Kategori = require('../models/kategori');


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
                            attributes: ['nama_barang'],
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


const createPengajuanCek = async (req, res) => {
    try {
        const { penyerahanId } = req.params;
        const { keluhan} = req.body;
        await PengajuanCek.create({
            keluhan,
            status_cek: 'sedang diproses',
            tanggal_pengecekan : new Date(),
            penyerahanId
        })

        return res.redirect('/karyawan/peminjamanAset')
    } catch (error) {
        console.error(error);
        console.log(error)
        return res.status(500).json({ message: 'Terjadi kesalahan saat membuat pengajuan cek' });
    }
};



module.exports = {
    getPeminjaman,
    createPengajuanCek
};