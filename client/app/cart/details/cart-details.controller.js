'use strict';

(function () {

  class CartDetailsController {

    constructor(CartService) {
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
    .component('cartDetails', {
      templateUrl: 'app/cart/details/cart-details.html',
      controller: CartDetailsController,
      bindings: {
        match:'<',
        onDelete: '&'
      }
    });
})();
