// src/passport.js
require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) =>
  User.findById(id)
    .then(user => done(null, user))
    .catch(err => done(err, null))
);

passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    console.log('🔔 [passport] callback de Google ejecutado');
    console.log('🔔 Perfil recibido:', {
      id: profile.id,
      displayName: profile.displayName,
      email: profile.emails?.[0]?.value
    });

    try {
      let user = await User.findOne({ googleId: profile.id });
      if (user) {
        console.log('🔔 [passport] Usuario existe, actualizando tokens');
        user.accessToken  = accessToken;
        user.refreshToken = refreshToken;
        await user.save();
        console.log('🔔 [passport] Tokens actualizados para:', user.email);
        return done(null, user);
      }

      console.log('🔔 [passport] Usuario nuevo, creando registro');
      user = await User.create({
        googleId:     profile.id,
        displayName:  profile.displayName,
        email:        profile.emails[0].value,
        photo:        profile.photos[0].value,
        accessToken,
        refreshToken
      });
      console.log('🔔 [passport] Usuario guardado:', {
        _id: user._id,
        googleId: user.googleId,
        email: user.email
      });
      done(null, user);
    } catch (err) {
      console.error('❌ [passport] Error en callback:', err);
      done(err, null);
    }
  }
));

