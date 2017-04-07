(function () {
  'use strict';

  class TicketsService {

    constructor($http) {
      this.$http = $http;
    }

    fetchReservedSeats(matchId, sectorName) {
      return this.$http.get('api/seats/reserved-on-match/' + matchId +'/sector/' + sectorName)
        .then(response => response.data);
    }

    getEventsStatistics(){
      return this.$http.get('/api/tickets/events-statistics')
        .then( response => response.data );
    }

    getDaysStatistics(){
      return this.$http.get('/api/tickets/days-statistics')
        .then( response => response.data );
    }

    addStadiumSeats() {
      return this.$http.post('/migrations')
        .then( response => response.data );
    }
  }
  angular.module('metalistTicketsApp')
    .service('TicketsService', TicketsService);
})();

