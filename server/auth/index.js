'use strict';

import express from 'express';
import passport from 'passport';
import config from '../config/environment';
import User from '../api/models/user.model';

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, done);
});

// Passport Configuration
require('./local/passport').setup(User, config);
require('./facebook/passport').setup(User, config);
require('./google/passport').setup(User, config);

var router = express.Router();

router.use('/local', require('./local').default);
router.use('/facebook', require('./facebook').default);
router.use('/google', require('./google').default);

export default router;
