'use strict';

(function () {

  class SeasonTicketController {

    constructor(SeasonTicketService) {
      this.seasonTicketService = SeasonTicketService;

      this.seasonTickets = [];
      this.blockRowSeats = [];
      this.errorMessageSeat = '';
      this.errorMessageBlockRow = '';
    }

    $onInit() {
      this.loadSeasonTickets();
      this.loadBlockRowSeats();
    }

    loadSeasonTickets() {
      this.seasonTicketService.loadSeasonTickets().then(response => this.seasonTickets = response.data);
      this.errorMessageSeat = '';
    }

    loadBlockRowSeats() {
      this.seasonTicketService.loadBlockRowSeats().then(response => this.blockRowSeats = response.data);
      this.errorMessageBlockRow = '';
    }

    createSeasonTicket($event) {
      let slug = 's' + $event.ticket.sector + 'r' + $event.ticket.row + 'st' + $event.ticket.seat;

      this.seasonTicketService.createSeasonTicket($event.ticket, slug)
        .then(() => {
          this.loadSeasonTickets();
        })
        .catch((err) => {
          if (err.status === 409) {
            this.errorMessageSeat = 'Это место уже занято.';
          }
        });
    }

    deleteSeasonTicket($event) {
      this.seasonTicketService.deleteSeasonTicket($event.slug)
        .then(() => {
          this.loadSeasonTickets();
        });
    }

    addBlockRow($event) {
      this.seasonTicketService.addBlockRow($event.blockRow)
        .then(() => this.loadBlockRowSeats())
        .catch((err) => {
          if (err.status === 409) {
            this.errorMessageBlockRow = 'Этот ряд уже заблокирован.';
          }
        });
    }

    deleteBlockRow($event) {
      this.seasonTicketService.deleteBlockRow($event.blockRow)
        .then(() => this.loadBlockRowSeats());
    }
  }

  angular.module('metalistTicketsApp.admin')
    .controller('SeasonTicketController', SeasonTicketController);
})();
