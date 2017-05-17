'use strict';

import express from 'express';
import passport from 'passport';
import {signToken} from '../auth.service';

let router = express.Router();

router.post('/', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        let error = err || info;
        if (error) {
            return res.status(401).json(error);
        }
        if (!user) {
            return res.status(404).json({message: 'Что-то пошло не так, попробуйте еще раз.'});
        }

        req.login(user, (error) => {
            if(error) {
                return res.status(500).json(error);
            }

            let token = signToken(user._id, user.role);
            return res.json({token});
        });
    })(req, res, next)
});

router.get('/logout', function (req, res, next) {
  req.session.destroy(function(err) {
    if(err) {
      console.log(err);
    } else {
      return res.status(200).json({message: 'Session destroy.'});
    }
  });
});

export default router;
