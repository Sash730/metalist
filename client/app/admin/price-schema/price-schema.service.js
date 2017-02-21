'use strict';

(function () {

  class PriceSchemaService {

    constructor($http) {
      this.$http = $http;

      this.colors = [{color: '#2bac21', colorName: 'green', price: '30'},
        {color: '#d020ca', colorName: 'violet', price: '50'},
        {color: '#fae30c', colorName: 'yellow', price: '80'},
        {color: '#093ac0', colorName: 'blue', price: '100'},
        {color: '#f02e2e', colorName: 'red', price: '150'}
      ];

    }

    loadPrices() {
      return this.$http.get('/api/priceSchema');
    }

    savePriceSchema(schema) {
      return this.$http({
        method: 'PUT',
        url: '/api/priceSchema/' + schema.price.name,
        data: {
                schema: schema
              },
        headers: {'Accept': 'application/json'}
      });
    }

    getPriceBySector(tribuneName, sectorNumber, priceSchema) {

      if ( !priceSchema['tribune_'+tribuneName] ) {
        return undefined;
      }

      if ( !priceSchema['tribune_'+tribuneName]['sector_'+sectorNumber] ) {
        return priceSchema['tribune_'+tribuneName].price;
      } else {
        if (!priceSchema['tribune_'+tribuneName]['sector_'+sectorNumber].price) {
          return priceSchema['tribune_'+tribuneName].price;
        }
        return priceSchema['tribune_'+tribuneName]['sector_'+sectorNumber].price;
      }
    }

    getColorByPrice(price) {
      return this.colors
        .filter(color => color.price == price)
        .map(color =>color.color)[0];
    }

    getStadium() {
      return this.$http.get('/app/sector/sectors/stadium.json');
    }

  }

  angular.module('metalistTicketsApp.admin')
    .service('PriceSchemaService', PriceSchemaService);
})();
