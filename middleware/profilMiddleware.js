const { User} = require('../models')

async function profileMiddleware(req, res, next) {
    try {
        const userId = req.userId; // Ambil userId dari session/token
        if (!userId) {
            return res.status(401).json({ message: "User tidak terautentikasi" });
        }

        const user = await User.findByPk(userId);

        if (!user) {
            res.locals.user = null;
        } else {
            res.locals.user = user; // Simpan di res.locals agar bisa diakses di semua EJS
        }

        req.user = user; 
        next();
    } catch (error) {
        console.error("Error di profileMiddleware:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
}




module.exports = profileMiddleware