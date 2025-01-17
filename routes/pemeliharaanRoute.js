const express = require('express')
const pemeliharaanRouter = express.Router()

pemeliharaanRouter.get('/admin/pemeliharaanAset', (req,res)=> {
    res.render('admin/pemeliharaan/pemeliharaanAset')
})

pemeliharaanRouter.get('/admin/pemeliharaanAset/detail', (req,res)=> {
    res.render('admin/pemeliharaan/detailPemeliharaan')
})

module.exports = pemeliharaanRouter