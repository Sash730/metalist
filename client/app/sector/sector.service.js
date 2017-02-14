(function () {
  'use strict';

  class SectorSeatsService {

    constructor($http) {
      this.$http = $http;
    }
/*
    fetchSector(id) {
      return this.$http.get('app/sector/sectors/stadium.constant.js')
        .then(response => response.data);
    }*/
  }
  angular.module('metalistTicketsApp')
    .service('SectorSeatsService', SectorSeatsService);
})();

