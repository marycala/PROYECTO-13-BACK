require("dotenv").config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const bcrypt = require('bcrypt');
const User = require('../../api/models/users');

const filePath = path.join(__dirname, '../../data/users.csv');

const readCSV = () => {
  return new Promise((resolve, reject) => {
    const users = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const cleanedRow = {
          userName: row.userName?.trim(),
          email: row.email?.trim(),
          password: row.password?.trim(),
          rol: row.rol?.trim() || 'user',
        };
        users.push(cleanedRow);
      })
      .on('end', () => resolve(users))
      .on('error', (error) => reject(error));
  });
};


const hashPasswords = async (users) => {
  return Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return {
        ...user,
        password: hashedPassword,
        rol: user.rol || 'user',
        events: [],
      };
    })
  );
};

const throwSeedUsers = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);

    await User.collection.drop();
    console.log('Users eliminated');

    const users = await readCSV();
    const hashedUsers = await hashPasswords(users);
    await User.insertMany(hashedUsers);
    console.log('Users introduced');

    await mongoose.disconnect();
    console.log('Disconnect from DB');
  } catch (error) {
    console.error('Error:', error);
  }
};

throwSeedUsers();
