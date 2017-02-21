'use strict';

(function () {

  angular.module('metalistTicketsApp.admin')
    .component('stadium', {
      templateUrl: 'app/stadium/stadium.html',
      controller: 'StadiumController',
      bindings: {
        priceSchema: '<',
        availabilitySchema: '<',
        onSectorSelect: '&'
      }
    });
})();

