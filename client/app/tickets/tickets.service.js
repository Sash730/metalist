(function () {
  'use strict';

  class TicketsService {

    constructor($http) {
      this.$http = $http;
    }

    fetchReservedSeats(matchId, sectorName) {
      return this.$http.get('api/seats/reserved-on-match/' + matchId + '/sector/' + sectorName)
        .then(response => response.data);
    }

    getMyTickets() {
      return this.$http.get('api/tickets/my')
        .then(response => response.data);
    }

    getPendingStatus() {
      return this.$http.get('api/orders/payment-status')
        .then(response => response.data.status);
    }

    getEventsStatistics() {
      return this.$http.get('/api/tickets/events-statistics')
        .then(response => response.data);
    }

    getDaysStatistics() {
      return this.$http.get('/api/tickets/days-statistics')
        .then(response => response.data);
    }
  }
  angular.module('metalistTicketsApp')
    .service('TicketsService', TicketsService);
})();

