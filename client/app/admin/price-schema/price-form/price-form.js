'use strict';

(function () {

  angular.module('metalistTicketsApp.admin')
    .component('priceForm', {
      templateUrl: 'app/admin/price-schema/price-form/price-form.html',
      controller: 'PriceFormController',
      bindings: {
        currentTribune: '<',
        currentSector: '<',
        currentRows: '<',
        currentPriceSchema: '<',
        currentAvailabilitySchema: '<',
        onUpdatePrice: '&'
      }
    });
})();
