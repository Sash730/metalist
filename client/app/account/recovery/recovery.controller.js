'use strict';

class RecoveryController {
  constructor(Auth) {
    this.Auth = Auth;
    this.message = '';
    this.errors = {};
    this.submitted = false;
  }


  recovery(form, email) {
    form.$setDirty();
    form.email.$setDirty();
    this.submitted = true;

    if (form.$valid) {
      this.Auth.recoveryPassword(email)
        .then((response) => {
          this.message = response.message;
        })
        .catch(err => {
          this.errors.other = err.message;
        });
    }
  }
}

angular.module('metalistTicketsApp')
  .controller('RecoveryController', RecoveryController);

