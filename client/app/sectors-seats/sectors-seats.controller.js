(function () {
  'use strict';

  class SectorSeatsController {
    constructor($http, $stateParams, sector) {
      this.sector = sector;
      this.$http = $http;
      this.sectorId = $stateParams.id;
      this.sectorName = 'Сектор';
    }

    makeArrayFromNumber = function (number) {
      return Array.apply(null, {length: number + 1}).map(Number.call, Number).filter(Boolean);
    };

    showAlert = function (event) {
      alert(event.target.id);
    };
  }

  angular.module('metalistTicketsApp')
    .controller('SectorSeatsController', SectorSeatsController);
})();
