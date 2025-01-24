const {  User, PengajuanCek, Penyerahan, Permintaan, Aset} = require('../models');
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
                                    attributes: ['serial_number', 'nama_barang'],
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

        

        return res.render('admin/pengajuanCek/daftarPengajuanCek', { pengajuanCekList }); // Render halaman admin untuk pengajuan cek
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data pengajuan cek' });
    }
};

const updateStatusPengajuanCek = async (req, res) => {
    try {
        const { id_cek } = req.params; // Ambil id_cek dari parameter URL
        const { status_cek } = req.body; // Ambil status_cek dari body request
        const currentPath = req.path; 

        // Validasi input status_cek
        const validStatuses = ['Sedang diproses', 'sudah diperbaiki', 'dibawa ke workshoop', 'diajukan ke vendor', 'tidak dapat diperbaiki'];
        if (!validStatuses.includes(status_cek)) {
            return res.status(400).json({ message: 'Status cek tidak valid' });
        }

        // Cari data pengajuan cek berdasarkan id_cek
        const pengajuanCek = await PengajuanCek.findByPk(id_cek);
        if (!pengajuanCek) {
            return res.status(404).json({ message: 'Pengajuan cek tidak ditemukan' });
        }

        // Update status_cek
        pengajuanCek.status_cek = status_cek;
        await pengajuanCek.save();

        return res.render('admin/pengajuanCek/daftarPengajuanCek', { pengajuanCekList, currentPath}); // Render halaman admin untuk pengajuan cek
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui status pengajuan cek' });
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
                                    attributes: ['serial_number', 'nama_barang'],
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
  
        // Render halaman detail pengajuan
        res.render('admin/pengajuanCek/detailPengajuanCek', {detailPengajuanCek})
        
    } catch (error) {
        console.error('Error saat mengambil detail pengajuan cek:', error);
        res.status(500).json({messege: 'Gagal memuat detail pengajuan cek', error: error.messege})
    }
};



module.exports = {
    getPengajuanCek,
    updateStatusPengajuanCek,
    getDetailPengajuanCek,
};
