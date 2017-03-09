'use strict';

(function () {

  class SeasonTicketController {

    constructor(SeasonTicketService) {
      this.seasonTicketService = SeasonTicketService;

      this.seasonTickets = [];
      this.seasonTicketToEdit = {};
      this.ticketNumber = '';
      this.message = '';
    }

    $onInit() {
      this.loadSeasonTickets();
    }

    loadSeasonTickets() {
      this.seasonTicketService.loadSeasonTickets().then( response => this.seasonTickets = response.data );
    }

    saveSeasonTicket($event) {
      this.seasonTicketService.saveSeasonTicket($event.ticket)
        .then(response => {
          if(response.data.message) {
            return this.message = response.data.message;
          }
          this.loadSeasonTickets();
          this.seasonTicketToEdit = {};
      })
    }

    edit($event) {
      this.seasonTicketToEdit = Object.assign({}, $event.ticket);
    }

    searchSeasonTicket() {
      this.seasonTicketService.searchSeasonTicket(this.ticketNumber)
        .then( ticket => {
          this.seasonTicketToEdit = Object.assign({}, ticket);
          this.ticketNumber = '';
        })
    }

    deleteSeasonTicket() {
      this.seasonTicketService.deleteSeasonTicket(this.ticketNumber)
        .then( () => {
          this.loadSeasonTickets();
          this.ticketNumber = '';
        })
    }
  }

  angular.module('metalistTicketsApp.admin')
    .controller('SeasonTicketController', SeasonTicketController);
})();
