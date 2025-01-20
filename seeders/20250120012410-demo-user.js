const bcrypt = require('bcrypt');
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   
     await queryInterface.bulkInsert('users', [{
         id: 1,
         nama : 'Admin',
         nip : '-',
         password: await bcrypt.hash('admin123', 10),
         email: 'adminict@gmail.com',
         role: 'admin',
         unit_kerja : 'ICT',
         jabatan : 'Admin',
         gambar : null,
         no_hp : '0856468654',
         created_at: new Date(),
         updated_at: new Date()
       }, 
       {
        id: 2,
        nama : 'Najla Humaira Desni',
        nip : '123456789',
        password: await bcrypt.hash('najla123', 10),
        email: 'najla@gmail.com',
        role: 'karyawan',
        unit_kerja : 'Rancang Bangun',
        jabatan : 'Staff',
        gambar : null,
        no_hp : '0856468654',
        created_at: new Date(),
        updated_at: new Date()
       }, 
       {
        id: 3,
        nama : 'Nadia Deari Hanifah',
        nip : '123456789',
        password: await bcrypt.hash('nadia123', 10),
        email: 'nadia@gmail.com',
        role: 'karyawan',
        unit_kerja : 'ICT',
        jabatan : 'Kepala Unit',
        gambar : null,
        no_hp : '0856468654',
        created_at: new Date(),
        updated_at: new Date()
       }, 
       {
        id: 4,
        nama : 'Rizka Kurnia Illahi',
        nip : '123456789',
        password: await bcrypt.hash('rizka123', 10),
        email: 'rizka@gmail.com',
        role: 'karyawan',
        unit_kerja : 'Internal Audit',
        jabatan : 'Kepala Unit',
        gambar : null,
        no_hp : '0856468654',
        created_at: new Date(),
        updated_at: new Date()
       },
       {
        id: 5,
        nama : 'Azhra Meisa Khairani',
        nip : '123456789',
        password: await bcrypt.hash('meisa123', 10),
        email: 'meisa@gmail.com',
        role: 'karyawan',
        unit_kerja : 'Capex',
        jabatan : 'Staff',
        gambar : null,
        no_hp : '0856468654',
        created_at: new Date(),
        updated_at: new Date()
       },
       {
        id: 6,
        nama : 'Rania Shofi Malika',
        nip : '123456789',
        password: await bcrypt.hash('rania123', 10),
        email: 'rania@gmail.com',
        role: 'karyawan',
        unit_kerja : 'Internal Audit',
        jabatan : 'Staff',
        gambar : null,
        no_hp : '0856468654',
        created_at: new Date(),
        updated_at: new Date()
       }
      
   ],{});
     
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.bulkDelete('users', null, {});
  }
};