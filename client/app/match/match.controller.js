'use strict';

(function () {

    class MatchController {

        constructor(match, cart, $state, PriceSchemaService) {
          this.priceSchemaService = PriceSchemaService;
          this.$state = $state;

          this.match = match;
          this.cart = cart;
          this.priceSchema = this.match.priceSchema.priceSchema;
        }

      getSectorsFill(tribuneName, sectorNumber) {
        let defaultColor = '#808080',
            price = this.priceSchemaService.getPriceBySector(tribuneName, sectorNumber, this.priceSchema);

        if (!price) {
          return defaultColor;
        } else {
          return this.priceSchemaService.getColorByPrice(price);
        }
      }

      goToSector($event, tribuneName, sectorNumber) {
        let price = this.priceSchemaService.getPriceBySector(tribuneName, sectorNumber, this.priceSchema);

        $event.preventDefault();
        if(price) {
          this.$state.go('sector', {id: this.match.id, tribune: tribuneName, sector: sectorNumber});
        }
    }

    }

    angular.module('metalistTicketsApp')
        .controller('MatchController', MatchController);
})();
