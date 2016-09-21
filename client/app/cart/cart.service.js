'use strict';

(function () {

    class CartService {

        constructor() {
            this.items = [{
                seatId: 1,
                matchId: 1,
                amount: 7000,
            }, {
                seatId: 2,
                matchId: 1,
                amount: 7000,
            }, {
                seatId: 3,
                matchId: 1,
                amount: 9000,
            }];
        }

        getItems() {
            return this.items;
        }

        addItem(seat, match) {
            this.items.push({
                seatId: seat._id,
                matchId: match._id,
                amount: seat.price
            });
        }

        removeItem(index) {
            this.items.splice(index, 1);
        }

        getTotalItems() {
            return this.items.length;
        }

        getTotalAmount() {
            return _.reduce(this.items, (amount, item) => {
                return amount + item.amount;
            }, 0);
        }
    }

    angular.module('metallistTicketsApp')
        .service('CartService', CartService);
})();
