
'use strict';

(function () {

  class CartSummaryController {

    constructor(CartService) {
      this.cart = {};
      this.cartService = CartService;
    }

    getPrice() {
      if (this.isCartLoaded()) {
        return this.cart.seats.reduce((price, seat) => {
          return price + seat.price;
        }, 0);
      }
    }

    getSize() {
      return this.cartService.getMyCartSize();
    }

    isCartLoaded() {
      this.cart = this.cartService.getMyCart();
      return this.cart.seats;
    }
  }

  angular.module('metalistTicketsApp')
    .component('cartSummary', {
      templateUrl: 'app/cart/summary/cart-summary.html',
      controller: CartSummaryController,
      controllerAs: 'vm',
    });
})();
