const jwt = require ('jsonwebtoken')

function isLogin(req, res, next) {
  const token = req.cookies.token;


  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_TOKEN, function (err, decoded) {
      if (err) {
        return res
          .status(500)
          .send({
            auth: false,
            message: "Gagal untuk melakukan verifikasi token.",
          });
      }
      req.userId = decoded.id;
      req.userRole = decoded.role;
      req.userEmail = decoded.email;
      req.userNama = decoded.nama;
      req.userNip= decoded.nip;
      req.userPassword = decoded.password;
      req.userNo_Hp = decoded.no_hp;
      req.userUnitKerja = decoded.unit_kerja;
      req.userJabatan = decoded.jabatan;
      req.userGambar = decoded.gambar;

    });
    console.log(token)
    if (req.userRole == "karyawan") {
      return res.redirect("/karyawan/daftar-aset");
    } else if (req.userRole == "admin") {
      return res.redirect("/admin/dashboard");
    }
  }

  next();
}

module.exports = isLogin;