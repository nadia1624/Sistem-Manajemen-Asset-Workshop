const express = require('express')
const PenyerahanController = require('../controllers/penyerahanControllers');
const verifyToken= require ('../middleware/validtokenMiddleware');
const role = require("../middleware/checkroleMiddleware");
const penyerahanRouter = express.Router()

//admin
penyerahanRouter.get(
    '/admin/penyerahanAset',
    verifyToken,
    role("admin"),
    PenyerahanController.getPenyerahan
  );

module.exports = penyerahanRouter