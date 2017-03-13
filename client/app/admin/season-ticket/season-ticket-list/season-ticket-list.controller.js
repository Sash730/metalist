'use strict';

(function () {

  class SeasonTicketListController {

    constructor() {
      this.tickets = [];
      this.date = new Date();
      this.date.setDate(this.date.getDate() + 1);
    }

    $onInit() {
    }

    $onChanges(changes) {
      if ( changes.seasonTickets ) {
        this.tickets = this.seasonTickets;
        this.fixDateInTickets();
      }
    }

    fixDateInTickets() {
      this.tickets.forEach(ticket => ticket.valid = new Date(ticket.valid));
    };

    edit(ticket) {
      this.onChange({
        $event: {
          ticket: ticket
        }
      });
    }

  }

  angular.module('metalistTicketsApp.admin')
    .controller('SeasonTicketListController', SeasonTicketListController);
})();
