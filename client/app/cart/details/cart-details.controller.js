'use strict';

(function () {

  class CartDetailsController {

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
    .component('cartDetails', {
      templateUrl: 'app/cart/details/cart-details.html',
      controller: CartDetailsController,
      bindings: {
        onDelete: '&'
      }
    });
})();
