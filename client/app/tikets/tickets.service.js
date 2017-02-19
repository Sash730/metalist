(function () {
  'use strict';

  class TicketsService {

    constructor($http) {
      this.$http = $http;
    }

    fetchReservedTickets(matchId, sectorName) {
      return this.$http.get('api/tickets/reserved-on-match/' + matchId +'/sector/' + sectorName)
        .then(response => response.data);
    }

    getCountPaidTickets(date){
      return this.$http({
        method: 'get',
        url:'/api/tickets/' + date,
        headers: {'Accept': 'application/json'}
      })
        .then(response => response.data);
    }

    checkTicket(code) {
      return this.$http.get('/api/tickets/' + code +'/check');
    }

    getTickets() {
      return this.$http.get('/api/tickets/sold-tickets');
    }
  }
  angular.module('metalistTicketsApp')
    .service('TicketsService', TicketsService);
})();

