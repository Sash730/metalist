'use strict';

(function () {

  class SeasonTicketListController {

    constructor() {
      this.tickets = [];
    }


    $onChanges(changes) {
      if ( changes.seasonTickets ) {
        this.tickets = this.seasonTickets;
      }
    }

    deleteTicket(ticket) {
      this.onDelete({$event: { slug: ticket.slug }});
    }

  }

  angular.module('metalistTicketsApp.admin')
    .controller('SeasonTicketListController', SeasonTicketListController);
})();
