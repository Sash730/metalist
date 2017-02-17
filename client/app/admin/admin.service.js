'use strict';

(function () {

  class AdminService {

    constructor($http) {
      this.$http = $http;
    }

    createMatch(a) {
      return this.$http({
        method: 'POST',
        url: '/api/matches',
        data: a,
        headers: {'Accept': 'application/json'}
      });
    }

    editMatch(a) {
      return this.$http({
        method: 'PUT',
        url: '/api/matches/' + a._id,
        data: a,
        headers: {'Accept': 'application/json'}
      });
    }

    deleteMatch(a) {
      return this.$http({
        method: 'delete',
        url: '/api/matches/' + a._id,
        headers: {'Accept': 'application/json'}
      });
    }

    getCountPaidOrders(a){
      return this.$http({
        method: 'get',
        url:'/api/orders/' + a,
        headers: {'Accept': 'application/json'}
      })
        .then((response) => AdminService.convertDataStingToObject(response.data));
    }

    checkTicket(code) {
      return this.$http.get('/api/tickets/' + code +'/check');
    }

    getTickets() {
      return this.$http.get('/api/tickets/sold-tickets');
    }

    static convertDataStingToObject(data) {
      for (let i=0; i < data.length; i++ ) {
        data[i].date = new Date(data[i].date);
      }

      return data;
    }
  }

  angular.module('metalistTicketsApp.admin')
    .service('AdminService', AdminService);
})();

