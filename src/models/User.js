// src/models/User.js
const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  googleId:    { type: String, required: true, unique: true },
  displayName: String,
  email:       String,
  photo:       String,
  accessToken: String,
  refreshToken:String,
  createdAt:   { type: Date, default: Date.now }
});

module.exports = model('User', userSchema);
