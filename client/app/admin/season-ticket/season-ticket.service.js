'use strict';

(function () {

  class SeasonTicketService {

    constructor($http) {
      this.$http = $http;
    }

    loadSeasonTickets() {
      return this.$http.get('/api/seasonTicket/season-tickets');
    }

    loadBlockRowSeats() {
      return this.$http.get('/api/seasonTicket/block-row');
    }

    createSeasonTicket(seasonTicket, slug) {
      return this.$http({
        method: 'POST',
        url: '/api/seasonTicket/' + slug,
        data: {
          ticket: seasonTicket
        },
        headers: {'Accept': 'application/json'}
      });
    }

    deleteSeasonTicket(slug) {
      return this.$http({
        method: 'DELETE',
        url: '/api/seasonTicket/' + slug,
        headers: {'Accept': 'application/json'}
      });
    }

    addBlockRow(blockRow) {
      return this.$http({
        method: 'POST',
        url: '/api/seasonTicket/addBlock/sector/' + blockRow.sector + '/row/' + blockRow.row,
        data: { blockRow: blockRow },
        headers: {'Accept': 'application/json'}
      });
    }

    deleteBlockRow(blockRow) {
      return this.$http({
        method: 'DELETE',
        url: '/api/seasonTicket/deleteBlock/sector/' + blockRow.sector + '/row/' + blockRow.row,
        headers: {'Accept': 'application/json'}
      });
    }
  }

  angular.module('metalistTicketsApp.admin')
    .service('SeasonTicketService', SeasonTicketService);
})();

