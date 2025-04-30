// src/db.js
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/gmail-auth-db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('❌ Error conectando a MongoDB', err));

module.exports = mongoose;

