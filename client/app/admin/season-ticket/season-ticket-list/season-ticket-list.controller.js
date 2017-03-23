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

  }

  angular.module('metalistTicketsApp.admin')
    .controller('SeasonTicketListController', SeasonTicketListController);
})();
