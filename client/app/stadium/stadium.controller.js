'use strict';

(function () {

  class StadiumController {

    constructor() {

      this.colors = [
        {color: '#ff972f', colorName: '1', price: '10'},
        {color: '#ffcc00', colorName: '2', price: '20'},
        {color: '#54aa6a', colorName: '3', price: '30'},
        {color: '#6f89c0', colorName: '4', price: '40'},
        {color: '#6f89c0', colorName: '5', price: '50'},
        {color: '#a1a6b0', colorName: '6', price: '100'},
        {color: '#d4d4d4', colorName: 'red', price: '150'}
      ];
    }

    $onInit() {
    }

    onSectorClick($event, tribuneName, sectorNumber) {
      let price = this.getPriceBySector(tribuneName, sectorNumber, this.priceSchema);

      $event.preventDefault();
      if (price) {
        this.onSectorSelect({
          $event: {
            tribune: tribuneName,
            sector: sectorNumber
          }
        });
      }
    }

    getColor(tribuneName, sectorNumber) {
      let defaultColor = '#808080',
        price = this.getPriceBySector(tribuneName, sectorNumber, this.priceSchema);

      if (!price) {
        return defaultColor;
      } else {
        return this.getColorByPrice(price);
      }
    }

    getColorByPrice(price) {
      return this.colors
        .filter(color => color.price == price)
        .map(color => color.color)[0];
    }

    getPriceBySector(tribuneName, sectorNumber, priceSchema) {

      if (!priceSchema['tribune_' + tribuneName]) {
        return undefined;
      }

      if (!priceSchema['tribune_' + tribuneName]['sector_' + sectorNumber]) {
        return priceSchema['tribune_' + tribuneName].price;
      } else {
        if (!priceSchema['tribune_' + tribuneName]['sector_' + sectorNumber].price) {
          return priceSchema['tribune_' + tribuneName].price;
        }
        return priceSchema['tribune_' + tribuneName]['sector_' + sectorNumber].price;
      }
    }
  }

  angular.module('metalistTicketsApp.admin')
    .controller('StadiumController', StadiumController);
})();
