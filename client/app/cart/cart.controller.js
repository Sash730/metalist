'use strict';

(function () {

    class CartController {

        constructor(CartService) {
            this.cart = CartService.cart;
            this.cartService = CartService;
        }

      removeItem(seatId) {
        this.cartService.removeTicket(seatId)
          .then(() => {
            this.onDelete({$event: { seatId: seatId }});
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
