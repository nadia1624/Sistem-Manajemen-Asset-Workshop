const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {

    const token = req.cookies.token;
  
    if (!token) {
      return res.redirect("/");
    }
  
    jwt.verify(token, process.env.JWT_SECRET_TOKEN, function(err, decoded) {
      if (err) {
        return res.status(500).send({ auth: false, message: 'Gagal untuk melakukan verifikasi token.' });
      }
  
      console.log(decoded);
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
      next();
    });

 

  }

  module.exports = verifyToken;