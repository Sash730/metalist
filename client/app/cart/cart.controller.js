'use strict';

(function () {

  class CartController {

    constructor(CartService) {
      this.cartService = CartService;
    }

    removeSeat(slug, matchId) {
      this.cartService.removeSeatFromCart(slug, matchId)
        .then(() => {
          this.onDelete({$event: { slug: slug, matchId: matchId }});
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
