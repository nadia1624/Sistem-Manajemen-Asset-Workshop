const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const path = require('path');
const fs = require('fs');
const { Op } = require("sequelize");
const { Pengembalian, Penyerahan, Permintaan, Aset, User } = require('../models');

const returnAset = async (req, res) => {
    try {
        const { idpenyerahan } = req.params; 

        const penyerahan = await Penyerahan.findOne({
            where: { id: idpenyerahan, status_penyerahan: 'sudah diserahkan' },
            include: [
                {
                    model: Permintaan,
                    include: [
                        { model: Aset, attributes: ['serial_number', 'nama_barang'] },
                        { model: User, attributes: ['nama', 'unit_kerja'] }
                    ]
                }
            ]
        });

        if (!penyerahan) {
            return res.status(404).json({ message: 'Data penyerahan tidak ditemukan atau belum diserahkan' });
        }

        const pengembalian = await Pengembalian.create({
            penyerahanId: penyerahan.id,
            kondisi_terakhir: "baik",
            keterangan_kondisi: null,
            gambar_bukti: null,
            tanggal_dikembalikan: new Date()
        });

        await Penyerahan.update(
            { 
                status_penyerahan: 'sudah dikembalikan', 
                penyerahanId: null 
            },
            { where: { id: idpenyerahan } }
        );

        return res.redirect('/karyawan/peminjamanAset');
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat mencatat pengembalian' });
    }
};

const getPengembalian = async (req, res) => {
    try {
        const pengembalianList = await Pengembalian.findAll({
            where: { gambar_bukti: { [Op.is]: null } }, 
            include: [
                {
                    model: Penyerahan,
                    include: [
                        {
                            model: Permintaan,
                            include: [
                                { model: Aset, attributes: ['serial_number', 'nama_barang'] },
                                { model: User, attributes: ['nama', 'unit_kerja'] }
                            ]
                        }
                    ]
                }
            ],
            order: [['tanggal_dikembalikan', 'DESC']]
        });

        return res.render('admin/pengembalian/pengembalianAset', { pengembalianList });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data pengembalian' });
    }
};

const riwayatPengembalian = async (req, res) => {
    try {
        const riwayatList = await Pengembalian.findAll({
            include: [
                {
                    model: Penyerahan,
                    include: [
                        {
                            model: Permintaan,
                            include: [
                                { model: Aset, attributes: ['serial_number', 'nama_barang'] },
                                { model: User, attributes: ['nama', 'unit_kerja'] }
                            ]
                        }
                    ]
                }
            ],
            order: [['tanggal_dikembalikan', 'DESC']]
        });

        const filteredRiwayatList = riwayatList.filter(item => item.gambar_bukti !== null);

        return res.render('admin/pengembalian/riwayatPengembalian', { riwayatList: filteredRiwayatList });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data pengembalian' });
    }
};

const addAssetReturn = async (req, res) => {
    const { id } = req.params; // Ambil ID pengembalian dari URL parameter
    const { kondisi_terakhir, keterangan_kondisi } = req.body;

    if (!id) {
        return res.status(400).json({ message: "ID pengembalian wajib diisi" });
    }

    if (!req.file) {
        return res.status(400).json({ message: "Bukti gambar harus diunggah" });
    }

    const gambar_bukti = req.file.filename;

    try {
        // Periksa apakah data pengembalian ada berdasarkan ID
        const pengembalian = await Pengembalian.findByPk(id);

        if (!pengembalian) {
            return res.status(404).json({ message: "Data pengembalian tidak ditemukan" });
        }

        // Perbarui data pengembalian yang ada, bukan membuat entri baru
        await pengembalian.update({
            kondisi_terakhir,
            keterangan_kondisi,
            gambar_bukti,
            tanggal_dikembalikan: new Date(),
        });

        res.json({ message: "Pengembalian aset berhasil ditambahkan", data: pengembalian });
    } catch (error) {
        res.status(500).json({
            message: "Terjadi kesalahan saat menambahkan data pengembalian",
            error: error.message
        });
    }
};



module.exports = {
    returnAset,
    getPengembalian,
    riwayatPengembalian,
    addAssetReturn
};
