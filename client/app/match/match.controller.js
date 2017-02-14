'use strict';

(function () {

    class MatchController {

        constructor(match, cart, PriceSchemaService) {
          this.priceSchemaService = PriceSchemaService;

          this.match = match;
          this.cart = cart;
        }

      getSectorsFill(tribuneName, sectorNumber) {
        let defaultColor = '#808080',
            priceSchema = this.match.priceSchema.priceSchema,
            price = this.priceSchemaService.getPriceBySector(tribuneName, sectorNumber, priceSchema);

        if (!price) {
          return defaultColor;
        } else {
          return this.priceSchemaService.getColorByPrice(price);
        }
      }
    }

    angular.module('metalistTicketsApp')
        .controller('MatchController', MatchController);
})();
