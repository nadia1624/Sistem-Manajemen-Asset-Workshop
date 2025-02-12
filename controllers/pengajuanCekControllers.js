const { where } = require('sequelize');
const {  User, PengajuanCek, Penyerahan, Permintaan, Aset, PengembalianVendor} = require('../models');
const Kategori = require('../models/kategori');

//menampilkan data pengajuan cek dihalaman admin
const getPengajuanCek = async (req, res) => {
    try {
        const pengajuanCekList = await PengajuanCek.findAll({
            include: [
                {
                    model: Penyerahan,
                    include: [
                        {
                            model: Permintaan,
                            include: [
                                {
                                    model: Aset,
                                    attributes: ['serial_number', 'nama_barang', 'cara_dapat'],
                                    include: [
                                        {
                                            model: Kategori,
                                            attributes: ['gambar']
                                        }
                                    ]
                                }
                            ]                            
                        }
                    ]
                }
            ],
            order: [['tanggal_pengecekan', 'DESC']] // Urutkan berdasarkan tanggal pengecekan terbaru
        });
        const  title = "Pengajuan Cek Aset"

        return res.render('admin/pengajuanCek/daftarPengajuanCek', { pengajuanCekList, title }); // Render halaman admin untuk pengajuan cek
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data pengajuan cek' });
    }
};


//menampilkan detail dihalaman pengajuan cek admin
const getDetailPengajuanCek = async (req, res) => {
    const { id } = req.params; // Mengambil ID pengajuanCek dari parameter URL
  
    try {
        // Mencari detail pengajuan cek berdasarkan ID
        const detailPengajuanCek = await PengajuanCek.findOne({
            where: { id },
            include: [
                {
                    model: Penyerahan,
                    include: [
                        {
                            model: Permintaan,
                            include: [
                                {
                                    model: Aset,
                                    attributes: ['serial_number', 'nama_barang', 'hostname', 'kondisi_aset', ],
                                    include: [
                                        {
                                            model: Kategori,
                                            attributes: ['nama_kategori','gambar','deskripsi']
                                        }
                                    ]
                                }, 
                                {
                                    model : User,
                                    attributes: ['nama']
                                }
                            ]                            
                        }
                    ]
                }
            ],
        });
  
        // Jika detail pengajuan tidak ditemukan, kirimkan halaman error
        if (!detailPengajuanCek) {
            return res.status(404).render('errorPage', { message: 'Pengajuan cek tidak ditemukan.' });
        }
        const  title = "Pengajuan Cek Aset"
  
        // Render halaman detail pengajuan
        res.render('admin/pengajuanCek/detailPengajuanCek', {detailPengajuanCek, title})
        
    } catch (error) {
        console.error('Error saat mengambil detail pengajuan cek:', error);
        res.status(500).json({messege: 'Gagal memuat detail pengajuan cek', error: error.messege})
    }
};

// Mengupdate status pengajuan cek
const updateStatusPengajuanCek = async (req, res) => {
    try {
        const { id } = req.params;  // Ambil ID dari URL
        const { status } = req.body;  // Ambil status dari request body

        console.log("ID Pengajuan:", id);
        console.log("Status yang dikirim:", status);

        // Cek apakah status valid
        const validStatuses = ['sedang diproses', 'sudah diperbaiki', 'dibawa ke workshoop', 'diajukan ke vendor', 'tidak dapat diperbaiki'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Status tidak valid" });
        }

        // Cari pengajuan berdasarkan ID dengan relasi yang benar
        const pengajuan = await PengajuanCek.findOne({
            where: { id },
            include: [
                {
                    model: Penyerahan,
                    include: [
                        {
                            model: Permintaan,
                            include: [
                                {
                                    model: Aset,
                                    include: [{ model: Kategori }]
                                }
                            ]
                        }
                    ]
                }
            ]
        });


        if (!pengajuan) {
            return res.status(404).json({ message: "Data pengajuan tidak ditemukan" });
        }

        if ( status === 'diajukan ke vendor'){
            const cara_dapat = pengajuan.Penyerahan.Permintaan.Aset.cara_dapat;
            if (cara_dapat !== 'sewa') {
            return res.status(400).json({ message: "Hanya aset dengan cara dapat 'sewa' yang dapat diperbarui" });} 
        }

        if ( status === 'tidak dapat diperbaiki'){
            const cara_dapat = pengajuan.Penyerahan.Permintaan.Aset.cara_dapat;
            if (cara_dapat !== 'beli') {
            return res.status(400).json({ message: "Hanya aset dengan cara dapat 'beli' yang dapat diperbarui" });} 
        }

        const idAset = pengajuan.Penyerahan.Permintaan.serial_number
        console.log (idAset)
        console.log (id)

        // Update status_cek
        await PengajuanCek.update({ status_cek: status }, { where: { id } });

        // Jika status adalah 'diajukan ke vendor', tambahkan data ke tabel PengembalianVendor
        if (status === 'diajukan ke vendor') {

            await Aset.update({
                kondisi_aset : 'rusak berat',
            },
        {
            where : {serial_number : idAset}
        })
            // Buat entri baru di PengembalianVendor
            await PengembalianVendor.create({
                status_admin: 'belum diproses',  // Status awal
                status_pengembalian: 'belum dikembalikan',  // Status awal
                cekId: pengajuan.id
                
            });

            console.log("Data berhasil ditambahkan ke PengembalianVendor");
        }

        if (status === 'tidak dapat diperbaiki'){
            await Aset.update({
                kondisi_aset : 'rusak berat',
            },
        {
            where : {serial_number : idAset}
        })
        }

        res.json({ message: "Status pengajuan berhasil diperbarui", status });
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ message: "Terjadi kesalahan dalam memperbarui status." });
    }
};



const updateStatusPengembalian = async (req, res) => {
    try {
        const {id} = req.params;
        await PengajuanCek.update(
            { status_pengembalian : 'sudah' },
            { where : {id} }
        );
        // Kirim response JSON
        res.json({ 
            success: true, 
            message: "Status pengembalian berhasil diperbarui" 
        });
        
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ 
            success: false,
            message: "Terjadi kesalahan dalam memperbarui status pengembalian." 
        });
    }
}



module.exports = {
    getPengajuanCek,
    getDetailPengajuanCek,
    updateStatusPengajuanCek,
    updateStatusPengembalian
};
