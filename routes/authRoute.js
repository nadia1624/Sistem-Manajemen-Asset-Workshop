const express = require('express')
const authController = require('../controllers/AuthControllers')
const isLogin = require('../middleware/isloginMiddleware');
const verifyToken= require ('../middleware/validtokenMiddleware');
const role = require("../middleware/checkroleMiddleware");
const upload = require('../middleware/uploadMiddleware');
const profileMiddleware = require('../middleware/profilMiddleware')

const authRouter = express.Router()

//auntentikasi
authRouter.get('/', isLogin, authController.form )
authRouter.post('/checklogin', authController.checklogin)
authRouter.post('/logout', verifyToken, authController.logout);
// authRouter.get('/logout', (req, res) => {
//     res.render('login', { currentPath: req.path });
// });

//admin
authRouter.get('/admin/dashboard', verifyToken, role("admin"), authController.dashboard )


//pengguna
authRouter.get('/karyawan/profil',  verifyToken, role("karyawan"),profileMiddleware,  authController.getUserProfile)

authRouter.post('/karyawan/uploadProfilePicture', 
    verifyToken, 
    upload.single('profilePicture'), 
    authController.uploadProfilePicture
);

authRouter.get('/karyawan/ubahProfil', verifyToken, role("karyawan"),profileMiddleware,  authController.getUbahProfile);

authRouter.post('/karyawan/ubahProfil/update', verifyToken, role("karyawan"), authController.updateUserProfile);

authRouter.get('/karyawan/ubahPass', verifyToken, role("karyawan"),profileMiddleware, authController.getUbahPasswordPage);

authRouter.post('/karyawan/ubahPass', verifyToken, role('karyawan'), authController.updatePassword) 

module.exports = authRouter