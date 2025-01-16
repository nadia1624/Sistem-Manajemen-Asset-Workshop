const db =  require('../config/db')
const {Sequelize} =  require('sequelize')
const Aset = require('./aset')
const User = require('./user')

const Permintaan = db.define (
    "Permintaan", {
        id : {
            type : Sequelize.INTEGER,
            autoIncrement : true,
            primaryKey : true,
            allowNull : false
        },
        status_permintaan : {
            type : Sequelize.ENUM,
            values : ['diproses', 'diterima','ditolak','dicancel'],
            allowNull : false
        },
        tanggal_permintaan : {
            type : Sequelize.DATE,
            allowNull : true
        },
        serial_number : {
            type : Sequelize.STRING,
            allowNull : false
        },
        userId : {
            type : Sequelize.INTEGER,
            allowNull : false
        }
    },
    {
        tableName: "permintaans",
        underscored: true,
        timestamps: true
    }
)
Permintaan.belongsTo(Aset, {
    foreignKey: "serial_number",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT"
})

Aset.hasMany(Permintaan, {
    foreignKey: "serial_number",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT"
})  

Permintaan.belongsTo(User, {
    foreignKey: "userId",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT"
})

User.hasMany(Permintaan, {
    foreignKey: "userId",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT"
})

module.exports = Permintaan