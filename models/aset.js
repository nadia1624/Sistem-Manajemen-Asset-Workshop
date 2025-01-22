const db = require('../config/db')
const {Sequelize} = require('sequelize')
const Kategori = require('./kategori')

const Aset = db.define(
    "Aset",
    {
        serial_number : {
            type : Sequelize.STRING,
            autoIncrement : false,
            allowNull: false,
            primaryKey: true
        },
        hostname : {
            type : Sequelize.STRING,
            allowNull : false
        },
        nama_barang : {
            type : Sequelize.STRING,
            allowNull : false,
        },
        ip_address : {
            type : Sequelize.STRING,
            allowNull : true
        },
        kondisi_aset : {
            type :  Sequelize.ENUM,
            values : ["baik", "rusak ringan", "rusak berat"],
            allowNull : false
        },
        cara_dapat : {
            type : Sequelize.ENUM,
            values : ["sewa", "beli"],
            allowNull : false
        },
        status_peminjaman : {
            type : Sequelize.ENUM,
            values: ["tersedia", "sedang diajukan", "dipinjam"],
            allowNull : false
        },
        kategoriId : {
            type : Sequelize.INTEGER,
            allowNull: false
        }
    }, 
    {
        tableName: "asets",
        underscored: true,
        timestamps: true
    }
)

Aset.belongsTo(Kategori, {
    foreignKey: "kategoriId",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT"
})

Kategori.hasMany(Aset, {
    foreignKey: "kategoriId",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT"
})

module.exports = Aset