'use strict';

(function () {

    class CartService {

        constructor($http) {
            this.$http = $http;

            $http.get('/api/orders/cart')
                .then(response => {
                    this.items = response.data.items;
                })
            ;
        }

        getItems() {
            return this.items;
        }

        addItem(seat, match) {

            this.$http.post('/api/orders/cart', {
                seatId: seat.id,
                matchId: match.id
            })
                .then(response => {
                    this.items = response.data.items;
                })
            ;
        }

        removeItem(id) {
            this.$http.delete('/api/orders/cart/items/' + id)
                .then(response => {
                    this.items = response.data.items;
                })
            ;
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
