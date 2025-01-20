const express = require('express')
// const {login} = require('../controllers/authController')

const authRouter = express.Router()

authRouter.get('/login', (req,res)=> {
    res.render('login')
})

authRouter.get('/dashboard', (req,res)=> {
    res.render('admin/dashboard')
})

authRouter.get('/profil', (req, res) => {
    res.render('profil', { currentPath: req.path });
});

authRouter.get('/ubahProfil', (req, res) => {
    res.render('ubahProfil', { currentPath: req.path });
});

authRouter.get('/ubahPass', (req, res) => {
    res.render('ubahPass', { currentPath: req.path });
});

authRouter.get('/logout', (req, res) => {
    res.render('login', { currentPath: req.path });
});


module.exports = authRouter