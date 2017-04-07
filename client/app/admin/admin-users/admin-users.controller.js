'use strict';

(function () {

  class AdminUsersController {

    constructor(User) {
      this.userService = User;
      this.users = [];
    }

    $onInit() {
      this.getUsers();
    }

    getUsers() {
      this.users = this.userService.query();
    }

    setRole(user, role) {
      if (user.role != role) {
        this.userService.setRole({id: user.id, role: role})
          .$promise.then(() => this.getUsers());
      }
    }

  }

  angular.module('metalistTicketsApp.admin')
    .controller('AdminUsersController', AdminUsersController);
})();
