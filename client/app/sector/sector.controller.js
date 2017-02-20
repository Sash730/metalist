
'use strict';

(function () {

  class SectorController {

    constructor(match, cart, sector, tickets, $stateParams, CartService, PriceSchemaService) {
      this.match = match;
      this.cart = cart;
      this.sector = sector;
      this.reservedTickets = tickets;
      this.tribuneName = $stateParams.tribune;
      this.priceSchemaService = PriceSchemaService;
      this.sectorPrice = '';

      this.addToCart = CartService.addTicket.bind(CartService);
      console.log('tickets', this.reservedTickets);
      this.getPrice();
    }

    getPrice() {
      let priceSchema = this.match.priceSchema.priceSchema;
      this.sectorPrice = this.priceSchemaService.getPriceBySector(this.tribuneName, this.sector.name, priceSchema);
    }

    makeArrayFromNumber (number) {
      return [...Array(parseInt(number) + 1).keys()].filter(Boolean);
    }

    showAlert (event){
      alert(event.target.id);
    }
  }

  angular.module('metalistTicketsApp')
    .controller('SectorController', SectorController);
})();
