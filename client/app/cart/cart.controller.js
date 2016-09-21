'use strict';

(function () {

    class CartController {

        constructor(CartService) {
            this.cart = CartService;
        }

        getTotalItems() {
            return this.cart.getTotalItems();
        }

        getTotalAmount() {
            return this.cart.getTotalAmount();
        }

        getItems() {
            return this.cart.getItems();
        }

        removeItem(index) {
            return this.cart.removeItem(index);
        }


    }


    angular.module('metallistTicketsApp')
        .component('cart', {
            templateUrl: 'app/cart/cart.html',
            controller: CartController,
            controllerAs: 'vm'
        });
})();
