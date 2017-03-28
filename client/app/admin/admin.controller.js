'use strict';

(function () {

  class AdminController {
    constructor(TicketsService) {
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
  }

  angular.module('metalistTicketsApp.admin')
    .controller('AdminController', AdminController);
})();
