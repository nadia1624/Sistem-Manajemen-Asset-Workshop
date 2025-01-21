const { Pemeliharaan, DetailPemeliharaan, Kategori, Aset, sequelize } = require('../models'); // Pastikan Anda mengimpor model dan sequelize dengan benar

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
         const listPemeliharaan = await Pemeliharaan.findAll({
            include : {
                model : Kategori,
                atribut : ['nama_kategori']
        }
    })

    res.render("admin/pemeliharaan/pemeliharaanAset", {
        kategoriList,
        listPemeliharaan: listPemeliharaan.map(p => ({
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
}

const detailPemeliharaan = async (req,res) => {
    try {
        const pemeliharaanId = req.params.id;
        const detailPemeliharaan = await DetailPemeliharaan.findAll({
            where : {
                pemeliharaanId : pemeliharaanId
            },
            include : {
                model : Aset,
                atribut : ['serial_number','nama_barang', 'gambar', 'kondisi_aset']
            }
        })
        
        res.render('admin/pemeliharaan/detailPemeliharaan', {detailPemeliharaan})
        
    } catch (error) {
        console.error('Error during detailPemeliharaan:', error);
        res.status(500).json({messege: 'Detail Pemeliharaan Eror', error: error.messege})
    }
}
    

module.exports = {
    createPemeliharaan,
    listPemeliharaan,
    detailPemeliharaan
}