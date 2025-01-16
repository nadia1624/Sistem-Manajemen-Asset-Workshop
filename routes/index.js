const express = require('express')
const authRoute = require('./authRoute.js')
const pengembalianRoute = require('./pengembalianRoute.js')

const router = express.Router()

router.use(authRoute)
router.use(pengembalianRoute)

module.exports = router