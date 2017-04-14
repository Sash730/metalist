'use strict';

(function () {

  class TicketsController {

    constructor(tickets) {
      this.tickets = tickets;
    }
  }

  angular.module('metalistTicketsApp')
    .controller('TicketsController', TicketsController);
})();
