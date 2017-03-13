'use strict';

(function () {

  class SeasonTicketController {

    constructor(SeasonTicketService) {
      this.seasonTicketService = SeasonTicketService;

      this.seasonTickets = [];
      this.seasonTicketToEdit = {};
      this.seatId = '';
    }

    $onInit() {
      this.loadSeasonTickets();
    }

    loadSeasonTickets() {
      this.seasonTicketService.loadSeasonTickets().then( response => this.seasonTickets = response.data );
    }

    saveSeasonTicket($event) {
      this.seasonTicketService.saveSeasonTicket($event.ticket)
        .then(() => {
          this.loadSeasonTickets();
          this.seasonTicketToEdit = {};
      })
    }

    edit($event) {
      this.seasonTicketToEdit = Object.assign({}, $event.ticket);
    }

    searchSeasonTicket() {
      this.seasonTicketService.searchSeasonTicket(this.seatId)
        .then( ticket => {
          this.seasonTicketToEdit = Object.assign({}, ticket);
          this.seatId = '';
        })
    }

    deleteSeasonTicket() {
      this.seasonTicketService.deleteSeasonTicket(this.seatId)
        .then( () => {
          this.loadSeasonTickets();
          this.seatId = '';
        })
    }

    deleteBlockRow($event) {
      this.seasonTicketService.deleteBlockRow($event.blockRow)
        .then( () =>  this.loadSeasonTickets() );
    }

    addBlockRow($event) {
      this.seasonTicketService.addBlockRow($event.blockRow)
        .then( () =>  this.loadSeasonTickets() );
    }
  }

  angular.module('metalistTicketsApp.admin')
    .controller('SeasonTicketController', SeasonTicketController);
})();
