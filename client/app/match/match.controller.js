'use strict';

(function () {

    class MatchSeatsController {

        constructor(match, seats, cart, CartService) {
            this.match = match;
            this.seats = seats;
            this.cart = cart;
            //this.addToCart = CartService.addItem.bind(CartService);
        }

      getSectorsFill(i) {
        //console.log('getSectorsFill', this.prices);
        if (i < 1) {
          //console.log('getSectorsFill 1- 9 ', i);
          return i = "#ff9999";
        } else {
          if (i > 0 && i < 10) {
            //console.log('getSectorsFill 1- 9 ', i);
            return i = "#ff9999";
          } else {
            if (i > 9 && i < 21) {
              //console.log('getSectorsFill 10- 20 ', i);
              return i = "#9900ff";
            } else {
              if (i > 20 && i < 30) {
                //console.log('getSectorsFill 20- 29 ', i);
                return i = "#006600";
              } else {
                if (i > 29 && i < 45) {
                  console.log('getSectorsFill 29- 44 ', i);
                  return i = "#000066";
                }
              }
            }
          }
        }
        }
    }

    angular.module('metalistTicketsApp')
        .controller('MatchSeatsController', MatchSeatsController);
})();
