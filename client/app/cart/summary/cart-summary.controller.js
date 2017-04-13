
'use strict';

(function () {

  class CartSummaryController {

    constructor(CartService) {
      this.cart = CartService.cart;
    }
  }

  angular.module('metalistTicketsApp')
    .component('cartSummary', {
      templateUrl: 'app/cart/summary/cart-summary.html',
      controller: CartSummaryController,
      controllerAs: 'vm',
    });
})();
