'use strict';

(function () {

  class MatchController {

    constructor(match, cart, $state) {
      this.$state = $state;

      this.match = match;
      this.cart = cart;
      this.priceSchema = this.match.priceSchema.price;
      this.availabilitySchema = this.match.priceSchema.availability || {};
    }

    goToSector($event) {
      let tribuneName = $event.tribune,
        sectorNumber = $event.sector,
        price = $event.price,
        availability = this.getAvailableStatus(tribuneName, sectorNumber);

      if (availability && price) {
        this.$state.go('sector', {id: this.match.id, tribune: tribuneName, sector: sectorNumber});
      }
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

  angular.module('metalistTicketsApp')
    .controller('MatchController', MatchController);
})();
