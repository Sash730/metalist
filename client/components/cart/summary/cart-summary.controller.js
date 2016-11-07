'use strict';

(function () {

    class CartSummaryController {

        constructor(CartService) {
            this.cart = CartService.cart;
        }
    }

    angular.module('metalistTicketsApp.cart')
        .component('cartSummary', {
            templateUrl: 'components/cart/summary/cart-summary.html',
            controller: CartSummaryController,
            controllerAs: 'vm',
        });
})();
