'use strict';

(function () {

    class CartService {

        constructor($http, Auth) {
            this.$http = $http;
            this.Auth = Auth;
            this.items = [];
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

        convertCartToOrderAsUser() {
            return this.convertCartToOrder(this.Auth.getCurrentUser());
        }

        convertCartToOrderAsGuest(guest) {
            return this.convertCartToOrder(guest);
        }

        convertCartToOrder(user) {
            return this.$http.post('/api/orders/cart/convert', {user: user});
        }

    }

    angular.module('metallistTicketsApp')
        .service('CartService', CartService);
})();
