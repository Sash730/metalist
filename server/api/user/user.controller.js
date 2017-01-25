'use strict';

import User from './../models/user.model';
import passport from 'passport';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';
import * as log4js from 'log4js';
import * as Mailer from '../../mailer/mailer.js';
import * as passwordGenerator from "../../passwordGenerator"

var logger = log4js.getLogger('User');

function validationError(res, statusCode) {
    statusCode = statusCode || 422;
    return function (err) {
        res.status(statusCode).json(err);
    }
}

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function (err) {
      logger.error('handleError '+err);
        res.status(statusCode).send(err);
    };
}

/**
 * Get list of users
 * restriction: 'admin'
 */
export function index(req, res) {
  logger.debug("order index");
    return User.find({}, '-salt -password').exec()
        .then(users => {
            return res.status(200).json(users);
        })
        .catch(handleError(res));
}

/**
 * Creates a new user
 */
export function create(req, res, next) {
    let newUser = new User(req.body);
    newUser.provider = 'local';
    newUser.role = 'user';
    newUser.save()
        .then(function (user) {
            var token = jwt.sign({_id: user._id}, config.secrets.session, {
                expiresIn: 60 * 60 * 5
            });
            res.json({token});
        })
        .catch(validationError(res));
}

/**
 * Get a single user
 */
export function show(req, res, next) {
  let userId = req.params.id;

    return User.findById(userId).exec()
        .then(user => {
            if (!user) {
                return res.status(404).end();
            }
            res.json(user.profile);
        })
        .catch(err => next(err));
}

/**
 * Deletes a user
 * restriction: 'admin'
 */
export function destroy(req, res) {
    return User.findByIdAndRemove(req.params.id).exec()
        .then(function () {
            res.status(204).end();
        })
        .catch(handleError(res));
}

/**
 * Change a users password
 */
export function changePassword(req, res, next) {
    let userId = req.user._id,
        oldPass = String(req.body.oldPassword),
        newPass = String(req.body.newPassword);

    return User.findById(userId).exec()
        .then(user => {
            if (user.authenticate(oldPass)) {
                user.password = newPass;
                return user.save()
                    .then(() => {
                        res.status(204).end();
                    })
                    .catch(validationError(res));
            } else {
                return res.status(403).end();
            }
        });
}

/**
 * Get my info
 */
export function me(req, res, next) {
  let userId = req.user._id;

    return User.findOne({_id: userId}, '-salt -password').exec()
        .then(user => { // don't ever give out the password or salt
            if (!user) {
                return res.status(401).end();
            }
            return res.json(user);
        })
        .catch(err => next(err));
}

/**
 * Generate temporary password
 */
export function generatePassword(req, res, next) {
  let email = String(req.body.email),
      password = passwordGenerator.generatePassByMail(),
      newUser = {};

  return User.findOne({email: email}).exec()
    .then(user => {
      if (user && user.name) {
        return res.status(200).json({message: 'Вы уже зарегистрированы.'});
      }
      if (user && !user.name) {
        newUser = user;
        newUser.password = password;
      }
      if (!user) {
        newUser = new User();
        newUser.email = email;
        newUser.password = password;
      }

        newUser.save().
          then((newUser) => {
            Mailer.sendMailTemporaryPassword(newUser.email, password);

            return res.status(200).json({message: 'На ваш email был выслан временный пароль.'});
          }
        )
        .catch(() => {
          return res.status(500).json({message: 'Что-то пошло не так... Попробуйте еще раз.'});
        });
    })
    .catch(err => next(err));
}

/**
 * Reset forget password and send temporary password
 */
export function recoveryPassword(req, res, next) {
  let email = String(req.body.email),
      password = passwordGenerator.generatePassByMail();

  return User.findOne({email: email}).exec()
    .then(user => {
      if (!user) {
        return res.status(200).json({message: 'Данный имейл не зарегистрирован.'});
      } else {
        user.password = password;
      }

      user.save()
        .then((user) => {
          console.log('recovery');
          Mailer.sendMailTemporaryPassword(user.email, password);

          return res.status(200).json({message: 'На ваш email был выслан временный пароль.'});
        }
      )
        .catch(() => {
          return res.status(500).json({message: 'Что-то пошло не так... Попробуйте еще раз.'});
        });
    })
    .catch(err => next(err));
}

/**
 * Authentication callback
 */
export function authCallback(req, res, next) {
    res.redirect('/');
}
