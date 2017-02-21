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
      $event.preventDefault();

        this.onSectorSelect({
          $event: {
            tribune: tribuneName,
            sector: sectorNumber
          }
        });

    }

    getColor(tribuneName, sectorNumber) {
      let defaultColor = '#808080',
        availability = this.getAvailableStatus(tribuneName, sectorNumber),
        price = this.getPriceBySector(tribuneName, sectorNumber);

      if (availability && !price || !availability) {
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

    getPriceBySector(tribuneName, sectorNumber) {
      let priceSchema = this.priceSchema;

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

    getAvailableStatus(tribuneName, sectorNumber) {
     // console.log('this.availabilitySchema', this.availabilitySchema);
      let availabilitySchema = this.availabilitySchema;

      if(!availabilitySchema['tribune_' + tribuneName] ) {
        return true;
      } else {
        if (!availabilitySchema['tribune_' + tribuneName]['sector_' + sectorNumber]){
          return availabilitySchema['tribune_' + tribuneName].availableStatus;
        }
        return availabilitySchema['tribune_' + tribuneName]['sector_' + sectorNumber].availableStatus
      }
    }
  }

  angular.module('metalistTicketsApp.admin')
    .controller('StadiumController', StadiumController);
})();
