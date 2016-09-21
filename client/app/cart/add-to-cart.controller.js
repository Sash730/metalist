'use strict';

(function () {

    class AddToCartController {

        constructor(CartService) {
            this.cart = CartService;
        }

        addToCart() {
            this.cart.addItem(this.seat, this.match);
        }
    }

    angular.module('metallistTicketsApp')
        .component('addToCart', {
            templateUrl: 'app/cart/add-to-cart.html',
            controller: AddToCartController,
            controllerAs: 'ac',
            bindings: {
                'seat': '<',
                'match': '<'
            }
        });
})();
