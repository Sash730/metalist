
'use strict';

(function () {

  class SectorSeatsController {

    constructor(match, seats, cart, sector, $stateParams, CartService) {

      this.match = match;
      this.seats = seats;
      this.cart = cart;
      this.sectorId = $stateParams.sector;
      this.sectorName = 'Сектор';
      this.addToCart = CartService.addTicket.bind(CartService);;
      this.sector = sector;

      this.makeArrayFromNumber = function(number) {
        return Array.apply(null, {length: number + 1}).map(Number.call, Number).filter(Boolean);
      };

      this.showAlert = function(event){
        alert(event.target.id);
      };

    }

  }

  angular.module('metalistTicketsApp')
    .controller('SectorSeatsController', SectorSeatsController);
})();
