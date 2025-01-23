const express = require('express')
const pemeliharaanController = require('../controllers/pemeliharaanControllers')
const verifyToken= require ('../middleware/validtokenMiddleware');
const role = require("../middleware/checkroleMiddleware");
const pemeliharaanRouter = express.Router()

pemeliharaanRouter.get('/admin/pemeliharaan-aset', verifyToken, role('admin'), pemeliharaanController.listPemeliharaan )

pemeliharaanRouter.get('/admin/pemeliharaan-aset/detail', (req,res)=> {
    res.render('admin/pemeliharaan/detailPemeliharaan')
})

pemeliharaanRouter.post('/admin/pemeliharaan-aset', verifyToken, role('admin'), pemeliharaanController.createPemeliharaan)

pemeliharaanRouter.get('/admin/pemeliharaan-aset/detail/:id', verifyToken, role('admin'), pemeliharaanController.detailPemeliharaan)

pemeliharaanRouter.post('/admin/pemeliharaan-aset/delete/:id', verifyToken, role('admin'), pemeliharaanController.deletePemeliharaan)

module.exports = pemeliharaanRouter