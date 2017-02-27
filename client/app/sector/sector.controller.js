
'use strict';

(function () {

  class SectorController {

    constructor(match, cart, sector, tickets, $stateParams, CartService, PriceSchemaService) {
      this.CartService = CartService;
      this.priceSchemaService = PriceSchemaService;
      this.match = match;
      this.cart = cart;
      this.sector = sector;
      this.reservedTickets = tickets;
      this.tribuneName = $stateParams.tribune;
      this.sectorPrice = '';
      this.rowRow = 'Ряд';

      this.getPrice();
    }

    getPrice() {
      let priceSchema = this.match.priceSchema.priceSchema;
      this.sectorPrice = this.priceSchemaService.getPriceBySector(this.tribuneName, this.sector.name, priceSchema);
    }


     addClassByCheckSoldSeat(seatId) {
      let checkTicket = this.reservedTickets.filter(ticket => ticket.seatId === seatId);

       return !checkTicket.length;
    }

     addTicketToCart(match, tribuneName, sectorName, rowName, seat, sectorPrice) {
      let seatId = 's' + sectorName + rowName + seat,
          checkTicket  = this.reservedTickets.filter(ticket => ticket.seatId === seatId);

      if( !checkTicket.length ) {
        this.CartService.addTicket(match, tribuneName, sectorName, rowName, seat, sectorPrice);
      }
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
