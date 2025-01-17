const express = require('express')
const pemeliharaanRouter = express.Router()

pemeliharaanRouter.get('/admin/pemeliharaan-aset', (req,res)=> {
    res.render('admin/pemeliharaan/pemeliharaanAset')
})

pemeliharaanRouter.get('/admin/pemeliharaan-aset/detail', (req,res)=> {
    res.render('admin/pemeliharaan/detailPemeliharaan')
})

module.exports = pemeliharaanRouter