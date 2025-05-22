require("dotenv").config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const User = require('../../api/models/users');
const Event = require('../../api/models/events');

const filePath = path.join(__dirname, '../../data/events.csv');

const readCSV = async () => {
  return new Promise((resolve, reject) => {
    const events = [];
    const promises = [];

    fs.createReadStream(filePath)
      .pipe(csv({ separator: ';' }))
      .on('data', (row) => {
        Object.keys(row).forEach(key => row[key.trim()] = row[key]);

        const eventPromise = (async () => {
          try {
            if (!row.creator) {
              console.log("Error: El campo 'creator' está vacío.");
              return;
            }
      
            const user = await User.findById(row.creator);
      
            if (!user) {
              console.log(`Usuario con ID ${row.creator} no encontrado.`);
              return;
            }
      
            events.push({
              title: row.title,
              category: row.category,
              img: row.image,
              date: new Date(row.date),
              location: row.location,
              description: row.description,
              price: parseFloat(row.price),
              creator: user._id,
              attendees: []
            });
          } catch (error) {
            console.error('Error al asignar creador:', error);
          }
        })();
        
        promises.push(eventPromise);
      })
      
      .on('end', async () => {
        await Promise.all(promises);
        resolve(events);
      })
      .on('error', (error) => reject(error));
  });
};

const throwSeedEvents = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);

    await Event.collection.drop();
    console.log('Events eliminated');

    const events = await readCSV();
    if (events.length > 0) {
      await Event.insertMany(events);
      console.log('Events introduced');
    } else {
      console.log('No events found in CSV to insert');
    }

    await mongoose.disconnect();
    console.log('Disconnect from DB');
  } catch (error) {
    console.error(error);
  }
};

throwSeedEvents();
