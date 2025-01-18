const express = require('express')
const authRoute = require('./authRoute.js')
const pengembalianRoute = require('./pengembalianRoute.js')
const permintaanRoute = require('./permintaanRoute.js')
const pengajuanCekRouter = require('./pengajuanCek.js')
const pengelolaanAsetRoute = require('./pengelolaanAset');
const penyerahanRoute = require('./penyerahanRoute.js')
const pemeliharaanRouter = require('./pemeliharaanRoute.js')
const pengembalianVendorRoute = require('./pengembalianVendor.js');
const peminjamanRouter = require('./peminjamanRoute.js')


const router = express.Router()

router.use(authRoute)
router.use(pengembalianRoute)
router.use(pengembalianVendorRoute)
router.use(permintaanRoute)
router.use(peminjamanRouter)
router.use(pengajuanCekRouter)
router.use(pengelolaanAsetRoute)
router.use(penyerahanRoute);
router.use(pemeliharaanRouter)



module.exports = router