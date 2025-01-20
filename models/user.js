const db =  require('../config/db')
const {Sequelize} =  require('sequelize')

const User = db.define(
    "User",
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        nama : {
            type : Sequelize.STRING,
            allowNull : false
        },
        nip : {
            type: Sequelize.STRING,
            allowNull: false
        },
        password : {
            type : Sequelize.STRING, 
            allowNull: false
        },
        email : {
            type: Sequelize.STRING,
            allowNull : false
        },
        role : {
            type: Sequelize.STRING, 
            allowNull : false
        },
        unit_kerja : {
            type : Sequelize.STRING,
            allowNull : false,
        },
        jabatan : {
            type : Sequelize.STRING,
            allowNull : true
        },
        gambar : {
            type : Sequelize.STRING,
            allowNull : true
        },
        no_hp : {
            type : Sequelize.STRING,
            allowNull: false
        }
    },
    {
        tableName: "users",
        underscored: true,
        timestamps: true
    }
)
module.exports = User