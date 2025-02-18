const express = require('express');
const { Op } = require("sequelize");
const { Pengembalian, Penyerahan, Permintaan, Aset, User, Kategori, sequelize} = require('../models');
const libre = require('libreoffice-convert');
const fs = require("fs");
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const { getImageXml } = require("docxtemplater-image-module/js/templates");
const { where } = require('sequelize');
const ImageModule = require('docxtemplater-image-module-free'); 
const sizeOf = require("image-size");


const returnAset = async (req, res) => {
    try {
        const { idpenyerahan } = req.params; 

        const penyerahan = await Penyerahan.findOne({
            where: { id: idpenyerahan},
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
                penyerahanId: null,
                status_penyerahan: 'telah dikembalikan'  
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

        const  title = "Pengembalian Aset"

        return res.render('admin/pengembalian/pengembalianAset', { pengembalianList, title });
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
        const  title = "Pengembalian Aset"

        const filteredRiwayatList = riwayatList.filter(item => item.gambar_bukti !== null);

        return res.render('admin/pengembalian/riwayatPengembalian', { riwayatList: filteredRiwayatList, title });
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
        // Fetch the return data with relationships
        const pengembalian = await Pengembalian.findByPk(id, {
            include: [{
                model: Penyerahan,
                include: [{
                    model: Permintaan,
                    include: [{
                        model: User,
                        attributes: ['nama', 'jabatan', 'unit_kerja']
                    }, {
                        model: Aset,
                        include: [{
                            model: Kategori,
                            attributes: ['nama_kategori', 'gambar']
                        }],
                        attributes: ['serial_number', 'hostname', 'nama_barang', 'ip_address']
                    }]
                }]
            }]
        });

        if (!pengembalian) {
            return res.status(404).json({ message: "Data pengembalian tidak ditemukan" });
        }

        // Get serial number from the relationship
        const serialNumber = pengembalian.Penyerahan?.Permintaan?.Aset?.serial_number;
        if (!serialNumber) {
            return res.status(404).json({ message: "Serial number aset tidak ditemukan" });
        }

        // Update return data
        await pengembalian.update({
            kondisi_terakhir,
            keterangan_kondisi,
            gambar_bukti,
            tanggal_dikembalikan: new Date()
        });
        const idPenyerahan = pengembalian.penyerahanId

        await Penyerahan.update(
            { 
                status_penyerahan: "telah dikembalikan"                                                                                                             
            },
            { where: { id: idPenyerahan } }
        );

        // Update asset status
        const aset = await Aset.findByPk(serialNumber);
        if (!aset) {
            return res.status(404).json({ message: "Data aset tidak ditemukan" });
        }

        await aset.update({
            kondisi_aset: kondisi_terakhir,
            status_peminjaman: "tersedia"
        });


        // Generate the document
        const templatePath = path.resolve(__dirname, "../public/templates/template_pengembalian.docx");
        if (!fs.existsSync(templatePath)) {
            return res.status(500).json({ message: "Template surat tidak ditemukan" });
        }

        const imageOpts = {
            centered: false,
            getImage: (tagValue) => fs.readFileSync(tagValue),
            getSize: (tagValue) => {
              const dimensions = sizeOf(tagValue); // Dapatkan ukuran asli gambar
              const width = 200; // Tetapkan lebar 150px
              const aspectRatio = dimensions.height / dimensions.width; // Hitung rasio aspek
              const height = Math.round(width * aspectRatio); // Sesuaikan tinggi secara otomatis
              return [width, height];
            },
          };

        const content = fs.readFileSync(templatePath);
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            modules: [new ImageModule(imageOpts)],
        });

        // Ensure valid paths for images
        const gambarAsetFilename = pengembalian.Penyerahan.Permintaan.Aset.Kategori.gambar;
        const gambarAsetFilePath = gambarAsetFilename
            ? path.resolve(__dirname, `../public/uploads/${gambarAsetFilename}`)
            : '';

        const gambarBuktiFilename = pengembalian.gambar_bukti;
        const gambarBuktiFilePath = gambarBuktiFilename
            ? path.resolve(__dirname, `../public/uploads/${gambarBuktiFilename}`)
            : '';

        const gambarTtdFilename = pengembalian.Penyerahan.tanda_tangan;
        const gambarTtdFilePath = gambarTtdFilename
            ? path.resolve(__dirname, `../public/uploads/${gambarTtdFilename}`)
            : '';

        const formatDate = (date) => {
        const months = [
             "Januari", "Februari", "Maret", "April", "Mei", "Juni",
             "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];

        const day = date.getDate().toString().padStart(2, '0');
        const month = months[date.getMonth()];
        const year = date.getFullYear();

        return `${day} ${month} ${year}`;
        };

        // Data for template rendering
        const templateData = {
            tanggal_dikembalikan: formatDate(new Date()),
            id: pengembalian.id,
            serial_number: serialNumber,
            kondisi_terakhir,
            keterangan_kondisi,
            nama: pengembalian.Penyerahan.Permintaan.User.nama,
            jabatan: pengembalian.Penyerahan.Permintaan.User.jabatan,
            unit_kerja: pengembalian.Penyerahan.Permintaan.User.unit_kerja,
            nama_kategori: pengembalian.Penyerahan.Permintaan.Aset.Kategori.nama_kategori,
            nama_barang: pengembalian.Penyerahan.Permintaan.Aset.nama_barang,
            hostname: pengembalian.Penyerahan.Permintaan.Aset.hostname,
            ip_address: pengembalian.Penyerahan.Permintaan.Aset.ip_address,
            gambar: gambarAsetFilePath || '',  // Ensure this is a valid path or empty string
            gambar_bukti: gambarBuktiFilePath || '',  // Ensure this is a valid path or empty string
            tanda_tangan: gambarTtdFilePath || '',   // Ensure this is a valid path or empty string
            year: new Date().getFullYear()
        };

        // Log the template data to see if any arrays or properties are undefined
        console.log("Template Data:", templateData);

        // Make sure all arrays or objects are valid
        Object.keys(templateData).forEach(key => {
            if (Array.isArray(templateData[key]) && !templateData[key].length) {
                templateData[key] = [];  // If it's an empty array, ensure it's correctly set
            }
            if (templateData[key] === undefined || templateData[key] === null) {
                templateData[key] = '';  // If undefined or null, replace with empty string
            }
        });

        // Render the template with the processed data
        await doc.renderAsync(templateData);

        // Save generated document
        const suratDir = path.resolve(__dirname, "../public/data/surat");
        if (!fs.existsSync(suratDir)) {
            fs.mkdirSync(suratDir, { recursive: true });
        }

        const timestamp = Date.now();
        const docxFilePath = path.join(suratDir, `pengembalian-${timestamp}.docx`);
        const pdfFilePath = docxFilePath.replace(".docx", ".pdf");

        fs.writeFileSync(docxFilePath, doc.getZip().generate({ type: "nodebuffer" }));

        // Convert to PDF
        await new Promise((resolve, reject) => {
            libre.convert(fs.readFileSync(docxFilePath), ".pdf", undefined, (err, result) => {
                if (err) {
                    return reject(new Error("Gagal mengonversi DOCX ke PDF"));
                }
                fs.writeFileSync(pdfFilePath, result);
                resolve();
            });
        });

        // Update database with the PDF file path
        await pengembalian.update({ surat: path.basename(pdfFilePath) });

        res.json({
            message: "Pengembalian aset berhasil dilakukan dan surat telah digenerate",
            pdfFilePath: path.basename(pdfFilePath)
        });

    } catch (error) {
        console.error("Terjadi kesalahan:", error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);  // Clean up uploaded file on error
        }
        res.status(500).json({
            message: "Terjadi kesalahan saat memproses pengembalian aset",
            error: error.message
        });
    }
};



const getRiwayatKaryawan = async (req, res) => {
    try {
        const userId = req.userId;  // Ensure that userId is available in the request
        const currentPath = req.path;

        const assets = await Pengembalian.findAll({
            include: [
                {
                    model: Penyerahan,
                    include: [
                        {
                            model: Permintaan,
                            where: { userId },
                            include: [
                                {
                                    model: Aset,
                                    include: [
                                        {
                                            model: Kategori,
                                            attributes: ['nama_kategori', 'deskripsi', 'gambar']
                                        }
                                    ],
                                    attributes: ['nama_barang']
                                }
                            ],
                            attributes: ['tanggal_permintaan']
                        }
                    ]
                }
            ],
            attributes: ['tanggal_dikembalikan', 'gambar_bukti', 'surat'],
            order: [['created_at', 'DESC']]
        });

        // Format the dates to show only day, month, and year
        const result = assets
            .filter(asset => asset.gambar_bukti) 
            .map(asset => {

            const tanggalPeminjaman = new Date(asset.Penyerahan.Permintaan.tanggal_permintaan);
            const tanggalPengembalian = new Date(asset.tanggal_dikembalikan);

            // Format date to "dd-mm-yyyy"
            const formattedTanggalPeminjaman = tanggalPeminjaman.toLocaleDateString('id-ID', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            });
            const formattedTanggalPengembalian = tanggalPengembalian.toLocaleDateString('id-ID', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            });

            const gambarBukti = asset.gambar_bukti;
            const suratPengembalian = asset.surat;
            const suratPenyerahan = asset.Penyerahan.surat;

            console.log(suratPengembalian)
            console.log(suratPenyerahan)


            return {
                nama_barang: asset.Penyerahan.Permintaan.Aset.nama_barang,
                kategori: asset.Penyerahan.Permintaan.Aset.Kategori.nama_kategori,
                deskripsi: asset.Penyerahan.Permintaan.Aset.Kategori.deskripsi,
                //gambar: asset.Penyerahan.Permintaan.Aset.Kategori.gambar,
                tanggal_peminjaman: formattedTanggalPeminjaman,
                tanggal_pengembalian: formattedTanggalPengembalian,
                gambar_bukti: gambarBukti,
                suratPengembalian : suratPengembalian,
                suratPenyerahan : suratPenyerahan

            };
        });

        const  title = "Riwayat Pengembalian Aset"

        return res.render('karyawan/riwayat/riwayatKaryawan', { result, currentPath, title });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
    }
};



module.exports = {
    returnAset,
    getPengembalian,
    riwayatPengembalian,
    addAssetReturn,
    getRiwayatKaryawan
};
