const express = require('express');
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
    const { id } = req.params; 
    const { kondisi_terakhir, keterangan_kondisi } = req.body;

    if (!id) {
        return res.status(400).json({ message: "ID pengembalian wajib diisi" });
    }

    if (!req.file) {
        return res.status(400).json({ message: "Bukti gambar harus diunggah" });
    }

    const gambar_bukti = req.file.filename;

    try {
        
        const pengembalian = await Pengembalian.findByPk(id, {
            include: {
                model: Penyerahan,
                include: {
                    model: Permintaan,
                    attributes: ["serial_number"],
                },
            },
        });

        if (!pengembalian) {
            return res.status(404).json({ message: "Data pengembalian tidak ditemukan" });
        }

        
        const serialNumber = pengembalian.Penyerahan?.Permintaan?.serial_number;

        if (!serialNumber) {
            return res.status(404).json({ message: "Serial number aset tidak ditemukan" });
        }

        await pengembalian.update({
            kondisi_terakhir,
            keterangan_kondisi,
            gambar_bukti,
            tanggal_dikembalikan: new Date(),
        });

        const aset = await Aset.findOne({ where: { serial_number: serialNumber } });

        if (!aset) {
            return res.status(404).json({ message: "Data aset tidak ditemukan" });
        }

        await aset.update({
            kondisi_aset: kondisi_terakhir,
            status_peminjaman: "tersedia",
        });

        res.json({ 
            message: "Pengembalian aset berhasil dilakukan",
            data: { pengembalian, aset }
        });
    } catch (error) {
        res.status(500).json({
            message: "Terjadi kesalahan saat memproses pengembalian aset",
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
