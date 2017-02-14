'use strict';

(function () {

  class AdminController {
    constructor(User, AdminService, PriceSchemaService) {
      this.users = User.query();
      this.adminService = AdminService;
      this.priceSchemaService = PriceSchemaService;

      this.matchDate = '';
      this.newMatch = {};
      this.newMatch.date = new Date();
      this.paidOrders = [];
      this.matches = [];
      this.tickets = [];
      this.ticket = {};
      this.message = '';

      this.priceSchemas = [];

      this.loadPriceSchemas();
      this.loadMatch();
    }


    loadMatch() {
      this.adminService.loadMatches()
        .then(response => this.matches = response);
    }

    loadPriceSchemas() {
      this.priceSchemaService.loadPrices()
        .then(response => {
          this.priceSchemas = response.data;
        });
    }

    createMatch(match) {
      this.adminService.createMatch(match)
        .then(() => {
          this.loadMatch();
          this.newMatch = {};
          this.newMatch.date = new Date();
        });
    }

    editMatch(match) {
      this.adminService.editMatch(match)
        .then(() => {
          this.loadMatch();
        });
    }

    deleteMatch(match) {
      this.adminService.deleteMatch(match)
        .then(() => {
          this.loadMatch();
        });
    }

    getCountPaidOrders(a) {
      this.adminService.getCountPaidOrders(a)
        .then(paidOrders => {
          this.paidOrders = paidOrders;
        });
    }

    checkTicket(code) {
      this.message = '';
      this.ticket = {};

      this.adminService.checkTicket(code)
        .then(response => {
          if (response.data.message) this.message = response.data.message;
          this.ticket = response.data;
        });
    }

    getTickets() {
      this.adminService.getTickets()
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
