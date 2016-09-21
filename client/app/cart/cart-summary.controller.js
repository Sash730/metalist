'use strict';

(function () {

    class CartSummaryController {

        constructor(CartService) {
            this.cart = CartService;
        }

        totalItems() {
            return this.cart.count();
        }

        totalAmount() {
            return this.cart.amount();
        }
    }

    angular.module('metallistTicketsApp')
        .component('cartSummary', {
            templateUrl: 'app/cart/cart-summary.html',
            controller: CartSummaryController,
            controllerAs: 'vm',
        });
})();
