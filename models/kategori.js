const db = require('../config/db');
const { Sequelize } = require('sequelize');

const Kategori = db.define(
  "Kategori",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    nama_kategori: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    gambar: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    deskripsi : {
        type : Sequelize.STRING,
        allowNull : true
    },
  },
  {
    tableName: "kategoris",
    underscored: true,
    timestamps: true,
  }
);

module.exports = Kategori;
