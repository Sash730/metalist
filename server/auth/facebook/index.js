'use strict';

import express from 'express';
import passport from 'passport';
import {setFacebookTokenCookie} from '../auth.service';

let router = express.Router();

router
    .get('/', passport.authenticate('facebook', {
        scope: ['email'],
        failureRedirect: '/signup',
        session: false
    }))
    .get('/callback', passport.authenticate('facebook', {
        failureRedirect: '/signup',
        session: false
    }), setFacebookTokenCookie);

export default router;
