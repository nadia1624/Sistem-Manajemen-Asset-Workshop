const db = require('../config/db')
const {Sequelize} = require('sequelize')
const PengajuanCek = require('./pengajuanCek')
const Aset = require('./aset')

const PengembalianVendor = db.define(
    "PengembalianVendor", {
        id : {
            type : Sequelize.INTEGER, 
            autoIncrement : true,
            primaryKey : true,
            allowNull : false
        }, 
        status_admin : {
            type : Sequelize.ENUM,
            values : ['belum diproses', 'sedang diproses', 'selesai'],
            allowNull : false
        },
        status_pengembalian : {
            type : Sequelize.ENUM,
            values : ['belum dikembalikan', 'sudah dikembalikan'],
            allowNull : true
        },
        cekId : {
            type : Sequelize.INTEGER,
            allowNull : true
        },
        serial_number : {
            type : Sequelize.STRING,
            allowNull : true
        }
    }, 
    {
        tableName: "pengembalian_vendor",
        underscored: true,
        timestamps: true
    }
)

PengembalianVendor.belongsTo(PengajuanCek,{
    foreignKey: "cekId",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT"
})

PengajuanCek.hasOne(PengembalianVendor, {
    foreignKey: "cekId",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT"
})

PengembalianVendor.belongsTo(Aset, {
    foreignKey: "serial_number",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT"
})

Aset.hasMany(PengembalianVendor, {
    foreignKey: "serial_number",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT"
})

module.exports = PengembalianVendor