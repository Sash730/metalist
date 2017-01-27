(function () {
  'use strict';

  class SectorSeatsService {

    constructor($http) {
      this.$http = $http;
    }

    fetchSector(id) {
      return this.$http.get('app/sector/sectors/sectors.json')
        .then(response => response.data);
    }
  }
  angular.module('metalistTicketsApp')
    .service('SectorSeatsService', SectorSeatsService);
})();

