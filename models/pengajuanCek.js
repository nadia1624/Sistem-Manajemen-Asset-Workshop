const db = require('../config/db')
const {Sequelize} =  require('sequelize')
const Penyerahan = require('./penyerahan')

const PengajuanCek = db.define(
    "PengajuanCek", {
        id : {
            type : Sequelize.INTEGER,
            autoIncrement : true,
            primaryKey : true,
            allowNull : false
        },
        status_cek : {
            type : Sequelize.ENUM, 
            values : ['sedang diproses','sudah diperbaiki', 'dibawa ke workshoop', 'diajukan ke vendor', 'tidak dapat diperbaiki'],
            allowNull : false
        }, 
        keluhan : {
            type : Sequelize.STRING, 
            allowNull : true
        },
        tanggal_pengecekan : {
            type : Sequelize.DATE, 
            allowNull : true
        },
        penyerahanId : {
            type : Sequelize.INTEGER, 
            allowNull : false
        }
    }, 
    {
        tableName: "pengajuan_cek",
        underscored: true,
        timestamps: true
    }
)

PengajuanCek.belongsTo(Penyerahan, {
    foreignKey: "penyerahanId",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT"
})

Penyerahan.hasMany(PengajuanCek, {
    foreignKey: "penyerahanId",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT"
})

module.exports = PengajuanCek