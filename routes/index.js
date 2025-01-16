const express = require('express')
const authRoute = require('./authRoute.js')
const pengembalianRoute = require('./pengembalianRoute.js')
const pengelolaanAsetRoute = require('./pengelolaanAset');

const router = express.Router()

router.use(authRoute)
router.use(pengembalianRoute)
router.use(pengelolaanAsetRoute);

module.exports = router