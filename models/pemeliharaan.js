const db = require('../config/db')
const {Sequelize} = require('sequelize')
const Kategori = require('./kategori')

const Pemeliharaan = db.define(
    "Pemeliharaan", {
        id : {
            type : Sequelize.INTEGER,
            autoIncrement : true,
            allowNull : false,
            primaryKey : true
        },
        jadwal : {
            type : Sequelize.DATE, 
            allowNull : false
        },
        jenis_pemeliharaan : {
            type : Sequelize.STRING, 
            allowNull : true
        },
        status_pemeliharaan : {
            type : Sequelize.ENUM, 
            values : ['belum terlaksana', 'sudah terlaksana', 'tidak terlaksana'],
            allowNull : false
        },
        kategoriId : {
            type : Sequelize.INTEGER, 
            allowNull : false
        },
        surat : {
            type : Sequelize.STRING,
            allowNull : true
        }
    }, 
    {
        tableName: "pemeliharaans",
        underscored: true,
        timestamps: true
    }
)

Pemeliharaan.belongsTo(Kategori, {
    foreignKey: "kategoriId",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT"
})

Kategori.hasMany(Pemeliharaan, {
    foreignKey: "kategoriId",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT"
})

module.exports = Pemeliharaan