
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
      this.availabilityRows = {};

      this.reservedTickets = [];
      this.selectedSeats = [];
      this.tribuneName = $stateParams.tribune;
      this.sectorPrice = '';
      this.rowRow = 'Ряд';
      this.message = '';

      this.getPrice();
      this.getReservedTickets();
      this.getSelectedSeats();
    }

    getPrice() {
      let priceSchema = this.match.priceSchema.price;

      this.availabilityRows = this.match.priceSchema.availabilityRows ?
                              this.match.priceSchema.availabilityRows['sector_'+this.sector.name] : {};
      this.sectorPrice = this.priceSchemaService.getPriceBySector(this.tribuneName, this.sector.name, priceSchema);
    }

    getReservedTickets() {
      let matchId = this.match.id,
        sectorName = this.sector.name;

      return this.ticketsService.fetchReservedTickets(matchId, sectorName)
        .then(tickets => this.reservedTickets = tickets);
    }

    getSelectedSeats(){
        this.cart._tickets.forEach(ticket => {
          this.selectedSeats.push(ticket.seat.id);
        });
    }

    updateReservedTickets($event) {
      this.getReservedTickets();
      this.selectedSeats.splice(this.selectedSeats.indexOf($event.seatId), 1);
    }

    getAvailabilityRow(rowName) {
      if( !this.availabilityRows.name ) return true;

      let [ availabilityRow ] =  this.availabilityRows.rows.filter(row => row.name === rowName);

      return !availabilityRow;
    }

     addClassByCheckSoldSeat(seatId, rowName) {
      let [ checkTicket ] = this.reservedTickets.filter(ticket => ticket.seatId === seatId),
          availabilityRow = this.getAvailabilityRow(rowName);

      if (checkTicket && this.selectedSeats.includes(seatId)) {
        return 'blockedSeat';
      }

       if ( !availabilityRow || (checkTicket && !this.selectedSeats.includes(seatId)) ) {
         return 'soldSeat';
       }

       return 'imgSeatsStyle';
    }

     addTicketToCart(match, tribuneName, sectorName, rowName, seat, sectorPrice) {
      let seatId = 's' + sectorName + 'r' + rowName + 'st' + seat,
          [ checkTicket ] = this.reservedTickets.filter(ticket => ticket.seatId === seatId),
          availabilityRow = this.getAvailabilityRow(rowName);
       this.message = '';

      if ( checkTicket && this.selectedSeats.includes(seatId) ) {
        this.CartService.removeTicket(seatId)
          .then(() => {
            this.getReservedTickets()
              .then( () => this.selectedSeats.splice(this.selectedSeats.indexOf(seatId), 1) );

          })
      }

      if( !checkTicket && availabilityRow ) {
        this.CartService.addTicket(match, tribuneName, sectorName, rowName, seat, sectorPrice)
          .then(message => {
            if (message) {
              this.message = message;
              return this.getReservedTickets();
            }
            this.getReservedTickets()
              .then( () => {
                this.selectedSeats = [];
                this.getSelectedSeats();
                this.selectedSeats.push(seatId);
              });
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
