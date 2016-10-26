'use strict';

(function () {

    class MatchSeatsController {

        constructor(match, seats, cart, CartService) {
            this.match = match;
            this.seats = seats;
            this.cart = cart;
            this.addToCart = CartService.addItem.bind(CartService);
        }
    }

    angular.module('metalistTicketsApp')
        .controller('MatchSeatsController', MatchSeatsController);
})();
