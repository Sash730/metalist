'use strict';

(function () {

  class StadiumController {

    constructor() {

      this.colors = [
        {color: '#ff972f', colorName: 'green', price: '10'},
        {color: '#ffcc00', colorName: 'violet', price: '20'},
        {color: '#54aa6a', colorName: 'yellow', price: '30'},
        {color: '#6f89c0', colorName: 'blue', price: '500'},
        {color: '#8b54aa', colorName: 'red', price: '100'}
      ];
      this.prices = [];
    }

    $onInit() {
    }

    onSectorClick($event, tribuneName, sectorNumber) {
      let price = this.getPriceBySector(tribuneName, sectorNumber, this.priceSchema);

      $event.preventDefault();

        this.onSectorSelect({
          $event: {
            price: price,
            tribune: tribuneName,
            sector: sectorNumber
          }
        });

    }

    getColor(tribuneName, sectorNumber) {
      let defaultColor = '#808080',
        //availability = this.getAvailableStatus(tribuneName, sectorNumber),
        price = this.getPriceBySector(tribuneName, sectorNumber, this.priceSchema);

      if ( !price ) {
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

    inPrices(price) {
      return this.prices.includes(parseInt(price));

    }

    getPriceBySector(tribuneName, sectorNumber, priceSchema) {

      if (!priceSchema['tribune_' + tribuneName]) {
        return undefined;
      }

      if (!priceSchema['tribune_' + tribuneName]['sector_' + sectorNumber]) {
        return priceSchema['tribune_' + tribuneName].price;
      } else {
        if (!priceSchema['tribune_' + tribuneName]['sector_' + sectorNumber].available) {
          return undefined;
        }
        return priceSchema['tribune_' + tribuneName]['sector_' + sectorNumber].price;
      }
    }
  }

  angular.module('metalistTicketsApp.admin')
    .controller('StadiumController', StadiumController);
})();
