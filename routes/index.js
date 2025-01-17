const express = require('express')
const authRoute = require('./authRoute.js')
const pengembalianRoute = require('./pengembalianRoute.js')
const permintaanRoute = require('./permintaanRoute.js')
const pengajuanCekRouter = require('./pengajuanCek.js')
const pengelolaanAsetRoute = require('./pengelolaanAset');
const pemeliharaanRouter = require('./pemeliharaanRoute.js')
const pengembalianVendorRoute = require('./pengembalianVendor.js');

const router = express.Router()

router.use(authRoute)
router.use(pengembalianRoute)
router.use(pengembalianVendorRoute)
router.use(permintaanRoute)
router.use(pengajuanCekRouter)
router.use(pengelolaanAsetRoute)
router.use(pemeliharaanRouter)


module.exports = router