'use strict';

(function () {

    class CartController {

        constructor(CartService) {
            this.cart = CartService.cart;
            this.removeItem = CartService.removeItem.bind(CartService);
        }
    }

    angular.module('metalistTicketsApp.cart')
        .component('cart', {
            templateUrl: 'components/cart/cart.html',
            controller: CartController,
            controllerAs: 'vm'
        });
})();
