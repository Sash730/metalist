'use strict';

(function () {

  class AdminController {
    constructor(User, TicketsService) {
      this.users = User.query();
      this.ticketsService = TicketsService;

      this.tickets = [];
      this.ticket = {};
      this.message = '';

    }

    checkTicket(code) {
      this.message = '';
      this.ticket = {};

      this.ticketsService.checkTicket(code)
        .then(response => {
          if (response.data.message) {
            this.message = response.data.message;
          }
          this.ticket = response.data;
        });
    }

    getTickets() {
      this.ticketsService.getTickets()
        .then(response => {
          this.tickets = response.data;
        })
      ;
    }

    delete(user) {
      user.$remove();
      this.users.splice(this.users.indexOf(user), 1);
    }
  }

  angular.module('metalistTicketsApp.admin')
    .controller('AdminController', AdminController);
})();
