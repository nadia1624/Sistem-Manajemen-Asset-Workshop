const db = require('../config/db')
const {Sequelize} = require('sequelize')
const Penyerahan = require('./penyerahan')

const Pengembalian = db.define(
    "Pengembalian", {
        id : {
            type : Sequelize.INTEGER,
            autoIncrement : true,
            allowNull : false,
            primaryKey : true
        }, 
        kondisi_terakhir : {
            type :  Sequelize.ENUM,
            values : ["baik", "rusak ringan", "rusak berat"],
            allowNull : false
        },
        keterangan_kondisi : {
            type : Sequelize.STRING, 
            allowNull : true
        },
        gambar_bukti : {
            type : Sequelize.STRING, 
            allowNull : true
        },
        tanggal_dikembalikan : {
            type : Sequelize.DATE, 
            allowNull : true
        },
        penyerahanId : {
            type : Sequelize.INTEGER, 
            allowNull : false
        },
        surat : {
            type : Sequelize.STRING, 
            allowNull : true
        }
    }, 
    {
        tableName: "pengembalians",
        underscored: true,
        timestamps: true
    }
)

Pengembalian.belongsTo(Penyerahan, {
    foreignKey: "penyerahanId",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT"
})

Penyerahan.hasMany(Pengembalian, {
    foreignKey: "penyerahanId",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT"
})

module.exports = Pengembalian