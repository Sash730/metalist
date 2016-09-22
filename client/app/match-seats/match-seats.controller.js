'use strict';

(function () {

    class MatchSeatsController {

        constructor(match, seats, CartService) {
            this.match = match;
            this.seats = seats;
            this.cart = CartService;
        }

        addToCart(seat) {
            this.cart.addItem(seat, this.match);
        }

        getTotalItems() {
            return this.cart.getTotalItems();
        }
    }

    angular.module('metallistTicketsApp')
        .controller('MatchSeatsController', MatchSeatsController);
})();
