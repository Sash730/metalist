
'use strict';

(function () {

  class SectorController {

    constructor(match, cart, sector, tickets, $stateParams, CartService, PriceSchemaService) {
      this.priceSchemaService = PriceSchemaService;
      this.CartService = CartService;
      this.match = match;
      this.cart = cart;
      this.sector = sector;
      this.reservedTickets = tickets;
      this.tribuneName = $stateParams.tribune;
      this.priceSchema = this.match.priceSchema.price;
      this.sectorPrice = '';

      //console.log('tickets', this.reservedTickets);
      this.getPrice();
    }

    getPrice() {
      this.sectorPrice = this.priceSchemaService.getPriceBySector(this.tribuneName, this.sector.name, this.priceSchema);
    }

    addClassByCheckSoldSeat(seatId, rowName) {
      let checkTicket = this.reservedTickets.filter(ticket => ticket.seatId === seatId),
          checkRowInPrice = true; //this.checkRowInSell(rowName);

      if (!checkRowInPrice) {
        return false;
      }
      return !checkTicket.length;
    }

    checkRowInSell(rowName) {
      let rows = this.priceSchema['tribune_'+this.tribuneName]['sector_'+ this.sector.name].rows,
        availableStatus = '';

      rows.forEach(row => {
        if (row.name === rowName) {
          availableStatus =  row.availableStatus;
        }
      });
      return availableStatus;
    }

    addTicketToCart(match, tribuneName, sectorName, rowName, seat, sectorPrice) {
      //console.log('seatId', seatId);
      let seatId = 's' + sectorName + rowName + seat,
          checkTicket = this.reservedTickets.filter(ticket => ticket.seatId === seatId);
          //checkRowInPrice = this.checkRowInSell(rowName);

      if(!checkTicket.length ) {//&& checkRowInPrice
        this.CartService.addTicket(match, tribuneName, sectorName, rowName, seat, sectorPrice);
      } else {
        console.log('taken');
      }
    }

    makeArrayFromNumber (number) {
      return [...Array(parseInt(number) + 1).keys()].filter(Boolean);
    }

  }

  angular.module('metalistTicketsApp')
    .controller('SectorController', SectorController);
})();
