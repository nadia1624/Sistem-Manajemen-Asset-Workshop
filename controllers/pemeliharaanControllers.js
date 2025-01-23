const { where } = require('sequelize');
const { Pemeliharaan, DetailPemeliharaan, Kategori, Aset, sequelize } = require('../models');

const createPemeliharaan = async (req, res) => {
    const transaction = await sequelize.transaction(); // Mulai transaksi
    try {
        // Data yang diambil dari request
        const { jadwal, jenis_pemeliharaan, kategoriId } = req.body;

        // 1. Buat data pemeliharaan
        const pemeliharaan = await Pemeliharaan.create(
            {
                jadwal,
                jenis_pemeliharaan,
                kategoriId,
                status_pemeliharaan: "belum terlaksana", 
            },
            { transaction } // Transaksi untuk memastikan atomicity
        );

        // 2. Ambil semua aset dari kategori yang dipilih
        const assets = await Aset.findAll({
            where: { kategoriId },
            transaction,
        });

        if (assets.length === 0) {
            throw new Error('Tidak ada aset pada kategori yang dipilih.');
        }

        // 3. Siapkan data untuk bulk insert ke detail_pemeliharaans
        const detailPemeliharaanData = assets.map((asset) => ({
            pemeliharaanId: pemeliharaan.id,
            serial_number: asset.serial_number,
            status_aset: asset.kondisi_aset,
            keterangan: `Pemeliharaan untuk aset ${asset.nama_barang}`,
        }));

        // 4. Insert data ke DetailPemeliharaan
        await DetailPemeliharaan.bulkCreate(detailPemeliharaanData, { transaction });

        // 5. Commit transaksi
        await transaction.commit();

        res.redirect('/admin/pemeliharaan-aset')
    } catch (error) {
        // Rollback transaksi jika terjadi error
        await transaction.rollback();
        console.error('Error during tambahPemeliharaan:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const listPemeliharaan = async (req, res) => {
    try {
        const kategoriList = await Kategori.findAll();

        // Mendapatkan data pemeliharaan
        const listPemeliharaan = await Pemeliharaan.findAll({
            include: {
                model: Kategori,
                attributes: ['nama_kategori'],
            },
        });

        // Mendapatkan tanggal hari ini
        const today = new Date();

        // Update status_pemeliharaan jika sudah lewat tanggal hari ini
        for (const pemeliharaan of listPemeliharaan) {
            const jadwal = new Date(pemeliharaan.jadwal);

            // Membandingkan hanya tahun, bulan, dan hari
            const isAfterToday =
                jadwal.getFullYear() < today.getFullYear() ||
                (jadwal.getFullYear() === today.getFullYear() &&
                    jadwal.getMonth() < today.getMonth()) ||
                (jadwal.getFullYear() === today.getFullYear() &&
                    jadwal.getMonth() === today.getMonth() &&
                    jadwal.getDate() < today.getDate());

            // Jika jadwal sudah lewat hari ini dan status masih belum terlaksana
            if (isAfterToday && pemeliharaan.status_pemeliharaan === 'belum terlaksana') {
                await Pemeliharaan.update(
                    { status_pemeliharaan: 'tidak terlaksana' },
                    { where: { id: pemeliharaan.id } }
                );
            }
        }

        // Refresh data pemeliharaan setelah update
        const updatedPemeliharaan = await Pemeliharaan.findAll({
            include: {
                model: Kategori,
                attributes: ['nama_kategori'],
            },
        });

        res.render("admin/pemeliharaan/pemeliharaanAset", {
            kategoriList,
            listPemeliharaan: updatedPemeliharaan.map(p => ({
                ...p.dataValues,
                jadwal: new Date(p.jadwal).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                }),
            })),
        });
    } catch (error) {
        console.error('Error during listPemeliharaan:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const detailPemeliharaan = async (req,res) => {
    try {
        const pemeliharaanId = req.params.id;
        const detailPemeliharaan = await DetailPemeliharaan.findAll({
            where : {
                pemeliharaanId : pemeliharaanId
            },
            include : {
                model : Aset,
                atribut : ['serial_number','nama_barang', 'kondisi_aset'],
                include : {
                    model : Kategori,
                    atribut : ['nama_kategori','gambar', 'deskripsi']
                }
            }
        })
        
        res.render('admin/pemeliharaan/detailPemeliharaan', {detailPemeliharaan})
        
    } catch (error) {
        console.error('Error during detailPemeliharaan:', error);
        res.status(500).json({messege: 'Detail Pemeliharaan Eror', error: error.messege})
    }
}

const deletePemeliharaan = async (req,res) => {
    try {
        await DetailPemeliharaan.destroy({
            where: {
                pemeliharaanId : req.params.id
            }
        })
        await Pemeliharaan.destroy({
            where : {
                id :req.params.id
            }
        })
        res.redirect('/admin/pemeliharaan-aset')
        
    } catch (error) {
        console.error('Error during deletePemeliharaan:', error);
        res.status(500).json({messege: 'Delete Pemeliharaan Eror', error: error.messege})
    }
}
    

module.exports = {
    createPemeliharaan,
    listPemeliharaan,
    detailPemeliharaan,
    deletePemeliharaan
}