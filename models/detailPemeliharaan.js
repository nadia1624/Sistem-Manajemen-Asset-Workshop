const db = require('../config/db')
const {Sequelize} = require('sequelize')
const Pemeliharaan = require('./pemeliharaan')
const Aset = require('./aset')

const DetailPemeliharaan = db.define(
    "DetailPemeliharaan", {
        keterangan : {
            type : Sequelize.STRING,
            allowNull : true
        },
        status_aset : {
            type :  Sequelize.ENUM,
            values : ["baik", "rusak ringan", "rusak berat"],
            allowNull : false
        },
        pemeliharaanId : {
            type : Sequelize.INTEGER,
            primaryKey : true,
            allowNull : false
        },
        serial_number : {
            type : Sequelize.STRING,
            primaryKey : true,
            allowNull : false
        }

    }
)

DetailPemeliharaan.belongsTo(Pemeliharaan, {
    foreignKey: "pemeliharaanId",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT"
})

Pemeliharaan.hasMany(DetailPemeliharaan, {
    foreignKey: "pemeliharaanId",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT"
})

DetailPemeliharaan.belongsTo(Aset, {
    foreignKey: "serial_number",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT"
})

Aset.hasMany(DetailPemeliharaan, {
    foreignKey: "serial_number",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT"
})
module.exports = DetailPemeliharaan