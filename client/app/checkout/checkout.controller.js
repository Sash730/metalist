'use strict';

(function () {

    class CheckoutController {

        constructor(CartService) {
            this.cart = CartService;
        }

        addToCart(seat) {
            this.cart.addItem(seat, this.match);
        }
    }

    angular.module('metallistTicketsApp')
        .controller('CheckoutController', CheckoutController);
})();
