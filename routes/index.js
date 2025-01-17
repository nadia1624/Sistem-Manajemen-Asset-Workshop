const express = require('express')
const authRoute = require('./authRoute.js')
const pengembalianRoute = require('./pengembalianRoute.js')
const permintaanRoute = require('./permintaanRoute.js')
const pengajuanCekRouter = require('./pengajuanCek.js')
const pengelolaanAsetRoute = require('./pengelolaanAset');
const penyerahanRoute = require('./penyerahanRoute.js')

const router = express.Router()

router.use(authRoute)
router.use(pengembalianRoute)

router.use(permintaanRoute)
router.use(pengajuanCekRouter)
router.use(pengelolaanAsetRoute)
router.use(penyerahanRoute);


module.exports = router