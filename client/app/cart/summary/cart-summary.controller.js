'use strict';

(function () {

    class CartSummaryController {

        constructor(CartService) {
            this.cart = CartService;
        }

        getTotalItems() {
            return this.cart.getTotalItems();
        }

        getTotalAmount() {
            return this.cart.getTotalAmount();
        }
    }

    angular.module('metallistTicketsApp')
        .component('cartSummary', {
            templateUrl: 'app/cart/summary/cart-summary.html',
            controller: CartSummaryController,
            controllerAs: 'vm',
        });
})();
