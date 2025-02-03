const db = require('../config/db')
const {Sequelize} = require('sequelize')
const Permintaan = require('./permintaan')

const Penyerahan = db.define(
    "Penyerahan", {
        id : {
            type : Sequelize.INTEGER,
            autoIncrement : true,
            primaryKey : true,
            allowNull : false
        },
        gambar_bukti : {
            type : Sequelize.STRING,
            allowNull: true,
        },
        surat : {
            type : Sequelize.STRING,
            allowNull : true
        },
        tanda_tangan : {
            type : Sequelize.STRING,
            allowNull : true
        },
        status_penyerahan : {
            type : Sequelize.ENUM,
            values : ['belum diserahkan', 'sudah diserahkan', 'telah dikembalikan'],
            allowNull : false
        },
        penerima : {
            type : Sequelize.STRING,
            allowNull : true
        },
        tanggal_penyerahan : {
            type : Sequelize.DATE,
            allowNull: true
        },
        permintaanId : {
            type: Sequelize.INTEGER,
            allowNull : false
        }
    }, 
    {
        tableName: "penyerahans",
        underscored: true,
        timestamps: true
    }
)
Penyerahan.belongsTo(Permintaan, {
    foreignKey: "permintaanId",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT"
})
Permintaan.hasOne(Penyerahan, {
    foreignKey: "permintaanId",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT"
})

module.exports = Penyerahan