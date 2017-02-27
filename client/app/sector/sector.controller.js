
'use strict';

(function () {

  class SectorController {

    constructor(match, cart, sector, TicketsService, $stateParams, CartService, PriceSchemaService) {
      this.CartService = CartService;
      this.priceSchemaService = PriceSchemaService;
      this.ticketsService = TicketsService;
      this.match = match;
      this.cart = cart;
      this.sector = sector;

      this.reservedTickets = [];
      this.selectedSeats = [];
      this.tribuneName = $stateParams.tribune;
      this.sectorPrice = '';
      this.rowRow = 'Ряд';

      this.getPrice();
      this.getReservedTickets(match.id, sector.name);
    }

    getPrice() {
      let priceSchema = this.match.priceSchema.priceSchema;
      this.sectorPrice = this.priceSchemaService.getPriceBySector(this.tribuneName, this.sector.name, priceSchema);
    }

    getReservedTickets(matchId, sectorName) {
      this.ticketsService.fetchReservedTickets(matchId, sectorName)
        .then(tickets => this.reservedTickets = tickets)
    }

     addClassByCheckSoldSeat(seatId) {
      let checkTicket = this.reservedTickets.filter(ticket => ticket.seatId === seatId);

       return !checkTicket.length;
    }

     addTicketToCart(match, tribuneName, sectorName, rowName, seat, sectorPrice) {
      let seatId = 's' + sectorName + rowName + seat,
          [ checkTicket ] = this.reservedTickets.filter(ticket => ticket.seatId === seatId);

      if (checkTicket && this.selectedSeats.includes(seatId)) {
        this.CartService.removeTicket(seatId)
          .then(() => {
            this.getReservedTickets(match.id, sectorName);
            this.selectedSeats.splice(this.selectedSeats.indexOf(seatId), 1);
          })
      }

      if( !checkTicket ) {
        this.selectedSeats.push(seatId);
        this.CartService.addTicket(match, tribuneName, sectorName, rowName, seat, sectorPrice)
          .then(() => {
            this.getReservedTickets(match.id, sectorName);
          });
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
