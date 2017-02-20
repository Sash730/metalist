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

      getSectorsFill(tribuneName, sectorNumber, priceSchema) {
        let defaultColor = '#808080',
            price = this.priceSchemaService.getPriceBySector(tribuneName, sectorNumber, priceSchema);

        if (!price) {
          return defaultColor;
        } else {
          return this.priceSchemaService.getColorByPrice(price);
        }
      }

      goToSector($event) {
        let price = this.priceSchemaService.getPriceBySector($event.tribune, $event.sector, this.priceSchema);
          console.log('$event', $event);
        //$event.preventDefault();
        if(price) {
          this.$state.go('sector', {id: this.match.id, tribune: $event.tribune, sector: $event.sector});
        }
    }

    }

    angular.module('metalistTicketsApp')
        .controller('MatchController', MatchController);
})();
