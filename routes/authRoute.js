const express = require('express')
// const {login} = require('../controllers/authController')

const authRouter = express.Router()

authRouter.get('/login', (req,res)=> {
    res.render('login')
})

authRouter.get('/dashboard', (req,res)=> {
    res.render('admin/dashboard')
})



module.exports = authRouter