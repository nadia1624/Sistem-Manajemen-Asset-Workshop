const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User, Aset, Permintaan, Penyerahan, Pemeliharaan, Kategori, PengajuanCek } = require("../models");
const path = require('path');
const { where } = require('sequelize');

const form = (req, res) => {
  res.render("login", { title: "Express", error: null });
};

const checklogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.log("User Not Found!");
      return res.status(404).render("login",{ title:"Express", error: "Email atau Passward salah! Silahkan coba lagi" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).render("login", { title: "Express",layout:false, error: "Email atau Passward salah! Silahkan coba lagi" });
    }

    const token = jwt.sign(
      { id: user.id, role : user.role},
      process.env.JWT_SECRET_TOKEN,
      { expiresIn: 86400 }
    );


    res.cookie("token", token, { httpOnly: true });


    if (user.role === "karyawan") {
      return res.redirect("/karyawan/daftar-aset");
    } else if (user.role === "admin") {
      return res.redirect("/admin/dashboard");
    }


    res.status(200).send({ auth: true, token: token });

  } catch (err) {
    console.error("Error during login: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const dashboard = async (req, res) => {
  try {
    const title = "Dashboard";

    // Ambil semua data aset
    const semuaAset = await Aset.findAll({
      attributes: ['status_peminjaman'] 
    });

    const semuaPermintaan = await Permintaan.findAll({
      attributes: ['status_permintaan'] 
    });

    const semuaPenyerahan = await Penyerahan.findAll({
      attributes: ['status_penyerahan'] 
    });

    const semuaCek = await PengajuanCek.findAll({
      attributes: ['status_cek'] 
    });

    const pemeliharaanTerdekat = await Pemeliharaan.findOne({
      where: { status_pemeliharaan: 'belum terlaksana' },
      order: [['jadwal', 'ASC']], // Urutkan dari jadwal terdekat
      attributes: ['status_pemeliharaan', 'jadwal'] // Ambil field yang diperlukan
    });

    let formattedDate = null;

    if (pemeliharaanTerdekat) {
      const bulanNama = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];

      const jadwalDate = new Date(pemeliharaanTerdekat.jadwal);
      formattedDate = `${jadwalDate.getDate()} ${bulanNama[jadwalDate.getMonth()]} ${jadwalDate.getFullYear()}`;
    }

    const kategoriData = await Kategori.findAll({
      include: [{ model: Aset }]
    });

    // Hitung total aset
    const totalAset = semuaAset.length;

    // Hitung jumlah aset tersedia dan dipinjam
    const asetTersedia = semuaAset.filter(aset => aset.status_peminjaman === 'tersedia').length;
    const asetDipinjam = semuaAset.filter(aset => aset.status_peminjaman === 'dipinjam').length;

    const permintaanDiproses = semuaPermintaan.filter(permintaan => permintaan.status_permintaan === 'diproses').length;

    const penyerahanDiproses = semuaPenyerahan.filter(penyerahan => penyerahan.status_penyerahan === 'belum diserahkan').length;

    const pengajuanDicek = semuaCek.filter(pengajuanCek => pengajuanCek.status_cek === 'sedang diproses').length;

    const labels = kategoriData.map(k => k.nama_kategori);
    const data = kategoriData.map(k => k.Asets.length);

    res.render("admin/dashboard", {
      title,
      req: req,
      statistik: {
        totalAset,
        asetTersedia,
        asetDipinjam,
        permintaanDiproses,
        penyerahanDiproses,
        pengajuanDicek,
        labels,
        data
      },
      jadwalTerdekat: pemeliharaanTerdekat ? { ...pemeliharaanTerdekat.toJSON(), formattedDate } : null
    });

  } catch (error) {
    console.error("Error during dashboard access:", error);
    res.status(500).json({ message: error.message });
  }
};


function logout(req, res) {
  res.clearCookie("token");
  res.redirect("/");
}

const getUserProfile = async (req, res) => {
  try {
      const userId = req.userId
      const successMessage = req.query.successMessage;
      const errorMessage = req.query.errorMessage;
      const title = "Profile"
      
      const user = await User.findByPk(userId, {
          attributes: ['nama', 'nip', 'email', 'unit_kerja', 'jabatan', 'gambar', 'no_hp']
      });

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.render('profil', { 
          currentPath: req.path, 
          user: user ,
          successMessage: successMessage, 
          errorMessage: errorMessage,
          title
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

const uploadProfilePicture = async (req, res) => {
try {
    if (!req.file) {
        return res.redirect('/karyawan/ubahProfil?error=Tidak ada file yang diunggah!');
    }

    const userId = req.userId;
    const imagePath = req.file.filename; 
    const fileExt = path.extname(imagePath).toLowerCase();

    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    if (!allowedExtensions.includes(fileExt)) {
        return res.redirect('/karyawan/ubahProfil?error=Format file harus JPG, JPEG, atau PNG!');
    }

    const user = await User.findByPk(userId);
    if (!user) {
        return res.redirect('/karyawan/ubahProfil?error=User tidak ditemukan!');
    }

    const [updated] = await User.update(
        { gambar: imagePath }, 
        { where: { id: userId } }
    );

    if (updated) {
        return res.redirect('/karyawan/profil?success=Foto profil berhasil diperbarui!');
    } else {
        return res.redirect('/karyawan/profil?error=Gagal memperbarui foto profil!');
    }
} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengunggah foto' });
}
};

const getUbahProfile= async (req, res) => {
try {
  const userId = req.userId;
  const title = "Change Profile"

  const user = await User.findByPk(userId);

  if (!user) {
    return res.status(404).json({ message: 'User tidak ditemukan' });
  }

  res.render('ubahProfil', {
    currentPath: req.path,
    user,
    title
  });
} catch (error) {
  console.error(error);
  res.status(500).json({ message: 'Gagal mengambil data profil' });
}
};

const updateUserProfile = async (req, res) => {
try {
  const userId = req.userId;
  const {email, unit_kerja, jabatan, no_hp } = req.body;

  if (!email || !unit_kerja || !jabatan || !no_hp) {
    return res.redirect('/karyawan/ubahProfil?error=Semua field harus diisi!');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.redirect('/karyawan/ubahProfil?error=Format email tidak valid!');
  }

  if (!/^\d{10,}$/.test(no_hp)) {
    return res.redirect('/karyawan/ubahProfil?error=No HP harus berupa angka dan minimal 10 digit!');
  }

  const user = await User.findByPk(userId);
  if (!user) {
    return res.redirect('/karyawan/ubahProfil?error=User tidak ditemukan!');
  }

  if (
    user.email === email &&
    user.unit_kerja === unit_kerja &&
    user.jabatan === jabatan &&
    user.no_hp === no_hp
  ) {
    return res.redirect('/karyawan/ubahProfil?error=Tidak ada perubahan data!');
  }

  const [updated] = await User.update(
    { email, unit_kerja, jabatan, no_hp },
    { where: { id: userId } }
  );

  if (updated) {
    return res.redirect('/karyawan/profil?success=Profil berhasil diperbarui!');
  } else {
    return res.redirect('/karyawan/profil?error=Gagal memperbarui profil!');
  }
} catch (error) {
  console.error(error);
  res.status(500).json({ message: 'Gagal memperbarui profil' });
}
};


const updatePassword = async (req, res) => {
try {
  const userId = req.userId;
  const {oldPassword, newPassword, confirmPassword} = req.body;

  const user = await User.findByPk(userId);
  
  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
  if (!isOldPasswordValid) {
    return res.redirect('/karyawan/ubahPass?error=Password lama yang dimasukkan salah!');
  }
  
  if(newPassword !== confirmPassword) {
    return res.redirect('/karyawan/ubahPass?error=Password baru dan konfirmasi tidak cocok!');
  }
  
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  await User.update(
    { password: hashedPassword },
    { where: { id: userId } }
  );

  return res.redirect('/karyawan/profil?success=Password berhasil diperbarui!');
      
} catch (error) {
  console.error(error);
  return res.redirect('/karyawan/ubahPass?error=Gagal memperbarui password');
}
}

const getUbahPasswordPage = async (req, res) => {
try {
    const userId = req.userId;
    const title = "Change Password"
    
    const user = await User.findByPk(userId, {
        attributes: ['nama', 'gambar', 'nip', 'email', 'unit_kerja', 'jabatan', 'no_hp']
    });

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.render('ubahPass', { 
        currentPath: req.path,
        user: user,
        successMessage: req.query.success,
        errorMessage: req.query.error,
        title
    });
} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
}
};

module.exports = {
  form,
  checklogin,
  logout,
  dashboard,
  getUserProfile,
  uploadProfilePicture,
  updateUserProfile,
  getUbahProfile,
  updatePassword,
  getUbahPasswordPage
};