const express = require('express')
const authRoute = require('./authRoute.js')
const pengembalianRoute = require('./pengembalianRoute.js')
const pengajuanCekRouter = require('./pengajuanCek.js')

const router = express.Router()

router.use(authRoute)
router.use(pengembalianRoute)
router.use(pengajuanCekRouter)

module.exports = router