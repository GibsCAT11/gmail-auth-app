// src/index.js
require('dotenv').config();             // Carga variables de entorno
require('./db');                       // Conecta con MongoDB
require('./passport');                 // Configura Passport

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const User = require('./models/User');  // Modelo para debug

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Ruta raíz (protegida)
app.get('/', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/auth/google');
  res.send(`
    <h1>¡Hola, ${req.user.displayName}!</h1>
    <p>Email: ${req.user.email}</p>
    <p><img src="${req.user.photo}" width="100"></p>
    <a href="/logout">Cerrar sesión</a>
  `);
});

// Iniciar OAuth con Google
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback de Google
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/google' }),
  (req, res) => {
    console.log('🔔 [index] Usuario autenticado:', req.user.email);
    res.redirect('/');
  }
);

// Logout
app.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
});

// Ruta DEBUG: lista todos los usuarios guardados
app.get('/debug/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error('❌ [index] Error consultando users:', err);
    res.status(500).json({ error: 'Error al consultar users', detail: err });
  }
});

// Levantar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Servidor en http://localhost:${PORT}`)
);