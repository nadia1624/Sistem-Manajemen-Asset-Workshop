const express = require('express')
const pengajuanCekControllers = require('../controllers/pengajuanCekControllers');
const verifyToken = require('../middleware/validtokenMiddleware');
const role = require("../middleware/checkroleMiddleware");
const pengajuanCekRouter = express.Router()

pengajuanCekRouter.get('/admin/daftarPengajuanCek', 
    verifyToken, 
    role("admin"), 
    pengajuanCekControllers.getPengajuanCek
);

// Route untuk menampilkan detail
pengajuanCekRouter.get(
    '/admin/detailPengajuanCek/:id',
    verifyToken,
    role("admin"),
    pengajuanCekControllers.getDetailPengajuanCek
  );


  // Route untuk memperbarui status pengajuan cek
pengajuanCekRouter.put(
  '/admin/updateStatusPengajuanCek/:id',
  verifyToken,
  role("admin"),
  pengajuanCekControllers.updateStatusPengajuanCek
);

pengajuanCekRouter.post('/admin/updateStatusPengembalian/:id', verifyToken, role('admin'), pengajuanCekControllers.updateStatusPengembalian)









// pengajuanCekRouter.get('/admin/daftarPengajuanCek', (req, res) => {
//     const currentPath = req.path; 
//     res.render('admin/pengajuanCek/daftarPengajuanCek', { currentPath }); 
// });

// pengajuanCekRouter.get('/admin/detailPengajuanCek', (req, res) => {
//     const currentPath = req.path; 
//     res.render('admin/pengajuanCek/detailPengajuanCek', { currentPath }); 
// });





module.exports = pengajuanCekRouter