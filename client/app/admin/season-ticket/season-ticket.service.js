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
        method: 'PUT',
        url: '/api/seasonTicket/' + seasonTicket.number,
        data: {
          ticket: seasonTicket
        },
        headers: {'Accept': 'application/json'}
      });
    }

    searchSeasonTicket(number) {
      return this.$http.get('/api/seasonTicket/' + number).then( response => response.data );
    }

    deleteSeasonTicket(number) {
      return this.$http({
        method: 'DELETE',
        url: '/api/seasonTicket/' + number,
        headers: {'Accept': 'application/json'}
      });
    }
  }

  angular.module('metalistTicketsApp.admin')
    .service('SeasonTicketService', SeasonTicketService);
})();

