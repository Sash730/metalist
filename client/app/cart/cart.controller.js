'use strict';

(function () {

  class CartController {

    constructor(CartService) {
      this.cart = CartService.cart;
      this.cartService = CartService;
    }

    removeSeat(slug) {
      this.cartService.removeSeatFromCart(slug)
        .then(() => {
          this.onDelete({$event: { slug: slug }});
        });
    }
  }

  angular.module('metalistTicketsApp')
    .component('cart', {
      templateUrl: 'app/cart/cart.html',
      controller: CartController,
      bindings: {
        onDelete: '&'
      }
    });
})();
