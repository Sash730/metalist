
'use strict';

(function () {

  class SectorController {

    constructor(match, sector, TicketsService, $stateParams, CartService, PriceSchemaService) {
      this.cartService = CartService;
      this.priceSchemaService = PriceSchemaService;
      this.ticketsService = TicketsService;
      this.match = match;
      this.cart = {};
      this.sector = sector;

      this.reservedTickets = [];
      this.selectedSeats = [];
      this.tribuneName = $stateParams.tribune;
      this.sectorPrice = '';
      this.rowRow = 'Ряд';
      this.message = '';
      this.firstUpperRow = this.getFirstUpperRow($stateParams.sector);

      this.getPrice();
      this.getCart();
      this.getReservedTickets();
    }

    getPrice() {
      let priceSchema = this.match.priceSchema.priceSchema;
      this.sectorPrice = this.priceSchemaService.getPriceBySector(this.tribuneName, this.sector.name, priceSchema);
    }

    getCart() {
      this.cartService.loadCart().then(cart => {
        this.cart = cart;
        this.getSelectedSeats();
      });
    }

    getReservedTickets() {
      let matchId = this.match.id,
        sectorName = this.sector.name;

      return this.ticketsService.fetchReservedTickets(matchId, sectorName)
        .then(tickets => this.reservedTickets = tickets);
    }

    getSelectedSeats(){
      this.selectedSeats = [];

        this.cart.tickets.forEach(ticket => {
          this.selectedSeats.push(ticket.seat.id);
        });
    }

    updateReservedTickets($event) {
      this.getReservedTickets();
      this.getSelectedSeats();
    }

     addClassByCheckSoldSeat(slug) {
      let [ checkTicket ] = this.reservedTickets.filter(ticket => ticket.slug === slug);

      if (checkTicket && this.selectedSeats.includes(slug)) {
        return 'blockedSeat';
      }

       if ( checkTicket && !this.selectedSeats.includes(slug) ) {
         return 'soldSeat';
       }

       return 'imgSeatsStyle';
    }

     addTicketToCart(match, tribuneName, sectorName, rowName, seat, sectorPrice) {
      let seatId = 's' + sectorName + 'r' + rowName + 'st' + seat,
          [ checkTicket ] = this.reservedTickets.filter(ticket => ticket.seatId === seatId);
       this.message = '';

      if ( checkTicket && this.selectedSeats.includes(seatId) ) {
        this.cartService.removeTicket(seatId)
          .then(() => {
            this.getReservedTickets()
              .then( () =>  this.getSelectedSeats() );
          })
      }

      if( !checkTicket ) {
        this.cartService.addTicket(match, tribuneName, sectorName, rowName, seat, sectorPrice)
          .then(message => {
            if (message) {
              this.message = message;
              return this.getReservedTickets();
            }
            this.getReservedTickets()
              .then( () => {
                this.selectedSeats.push(seatId);
              });
          });
      }
    }

    getFirstUpperRow(sectorNumber) {
      let sectorDividers = {
        "1": 19,
        "2": 20,
        "8": 20,
        "9": 19,
        "10": 15,
        "11": 15,
        "12": 15,
        "13": 15,
        "14": 15,
        "15": 15,
        "16": 15,
        "17": 15,
        "18": 15,
        "19": 15,
        "20": 15,
        "22": 9,
        "23": 9,
        "24": 9,
        "25": 9,
        "26": 9,
        "27": 9,
        "28": 9,
        "29": 9,
      };
      return sectorDividers[sectorNumber] || 1;
    }

    makeArrayFromNumber (number) {
      return [...Array(parseInt(number) + 1).keys()].filter(Boolean);
    }

    isSkybox() {
      let skyBoxes = ['SB_1', 'SB_2', 'SB_3_5', 'SB_6', 'SB_7', 'SB_8', 'SB_9', 'SB_10', 'SB_11' ]
      return skyBoxes.includes(this.sector.name);
    }

    isFreeSeats() {
      let tribuneNames = ['east', 'north'];
      return tribuneNames.includes(this.tribuneName);
    }
  }

  angular.module('metalistTicketsApp')
    .controller('SectorController', SectorController);
})();
