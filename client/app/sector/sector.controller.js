
'use strict';

(function () {

  class SectorController {

    constructor(match, cart, sector, $stateParams, CartService) {

      this.match = match;
      this.cart = cart;
      this.tribuneName = $stateParams.tribune;
      this.sector = sector;

      this.addToCart = CartService.addTicket.bind(CartService);
      console.log('tribuneName', this.tribuneName);
    }

    makeArrayFromNumber (row, number) {
      let seats = Array.apply(null, {length: number + 1}).map(Number.call, Number).filter(Boolean);
      console.log('seats-'+row, number , seats);
      return seats;
    };

    showAlert (event){
      alert(event.target.id);
    };
  }

  angular.module('metalistTicketsApp')
    .controller('SectorController', SectorController);
})();
