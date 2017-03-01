'use strict';

const PasswordGenerator = require('strict-password-generator').default;
const passwordGenerator = new PasswordGenerator();

const options = {
  upperCaseAlpha   : true,
  lowerCaseAlpha   : true,
  number           : true,
  specialCharacter : false,
  minimumLength    : 8,
  maximumLength    : 10
};

export function generatePassByMail() {
 return  passwordGenerator.generatePassword(options);
}
