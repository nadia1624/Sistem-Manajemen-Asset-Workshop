const express = require('express')
const authRoute = require('./authRoute.js')
const pengembalianRoute = require('./pengembalianRoute.js')
const permintaanRoute = require('./permintaanRoute.js')

const router = express.Router()

router.use(authRoute)
router.use(pengembalianRoute)
router.use(permintaanRoute)

module.exports = router