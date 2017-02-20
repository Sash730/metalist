'use strict';

(function () {

  class StadiumController {

    constructor(PriceSchemaService) {
      this.priceSchemaService = PriceSchemaService;
    }
  }

  angular.module('metalistTicketsApp')
    .component('stadium', {
      templateUrl: 'components/stadium/stadium.html',
      controller: StadiumController,
      bindings: {
        onSelectSector: '&',
        price: '<',
        fill: '<'
      }
    });
})();
