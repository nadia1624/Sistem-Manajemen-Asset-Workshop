const express = require('express')
const authController = require('../controllers/AuthControllers')
const isLogin = require('../middleware/isloginMiddleware');
const verifyToken= require ('../middleware/validtokenMiddleware');
const role = require("../middleware/checkroleMiddleware");

const authRouter = express.Router()

//auntentikasi
authRouter.get('/', isLogin, authController.form )
authRouter.post('/checklogin', authController.checklogin)
authRouter.post('/logout', verifyToken, authController.logout);
// authRouter.get('/logout', (req, res) => {
//     res.render('login', { currentPath: req.path });
// });

//admin
authRouter.get('/admin/dashboard', verifyToken, role("admin"),  authController.dashboard )


//pengguna
authRouter.get('/profil', (req, res) => {
    res.render('profil', { currentPath: req.path });
});

authRouter.get('/ubahProfil', (req, res) => {
    res.render('ubahProfil', { currentPath: req.path });
});

authRouter.get('/ubahPass', (req, res) => {
    res.render('ubahPass', { currentPath: req.path });
});




module.exports = authRouter