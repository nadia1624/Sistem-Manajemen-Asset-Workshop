const express = require('express')

const penyerahanRouter = express.Router()

//admin
penyerahanRouter.get('/admin/penyerahanAset', (req, res) => {
    res.render('admin/penyerahan/penyerahanAset');
});

module.exports = penyerahanRouter