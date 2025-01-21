const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
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

module.exports = {
    returnAset
};
