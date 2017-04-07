'use strict';

(function () {

  class SeasonTicketService {

    constructor($http) {
      this.$http = $http;
    }

    loadSeasonTickets() {
      return this.$http.get('/api/seasonTicket');
    }

    saveSeasonTicket(seasonTicket) {
      return this.$http({
        method: 'POST',
        url: '/api/seasonTicket',
        data: {
          ticket: seasonTicket
        },
        headers: {'Accept': 'application/json'}
      });
    }

    searchSeasonTicket(seatId) {
      return this.$http.get('/api/seasonTicket/' + seatId).then( response => response.data );
    }

    deleteSeasonTicket(seatId) {
      return this.$http({
        method: 'DELETE',
        url: '/api/seasonTicket/' + seatId,
        headers: {'Accept': 'application/json'}
      });
    }

    addBlockRow(blockRow) {
      return this.$http({
        method: 'PUT',
        url: '/api/seasonTicket/addBlock/' + blockRow.sector + '/' + blockRow.row,
        data: { blockRow: blockRow },
        headers: {'Accept': 'application/json'}
      });
    }

    deleteBlockRow(blockRow) {
      return this.$http({
        method: 'PUT',
        url: '/api/seasonTicket/deleteBlock/' + blockRow.sector + '/' + blockRow.row,
        data: { blockRow: blockRow },
        headers: {'Accept': 'application/json'}
      });
    }
  }

  angular.module('metalistTicketsApp.admin')
    .service('SeasonTicketService', SeasonTicketService);
})();

