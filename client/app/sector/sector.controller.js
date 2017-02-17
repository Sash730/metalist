
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

    makeArrayFromNumber (number) {
      return [...Array(parseInt(number)).keys()];
    };

    showAlert (event){
      alert(event.target.id);
    };
  }

  angular.module('metalistTicketsApp')
    .controller('SectorController', SectorController);
})();
