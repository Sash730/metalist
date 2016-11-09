'use strict';

(function () {

    class CartService {

        constructor($http, Auth, $cookies) {
            this.$http = $http;
            this.Auth = Auth;
            this.$cookies = $cookies;
            this.items = [];
            this.cart = new Cart();

            this.loadCart();
        }

        loadCart() {
            this.$http.get('/api/orders/cart')
                .then(response => {
                    this.cart.items = response.data.items;

                if (!this.$cookies.get('cart') ||
                          this.$cookies.get('cart') !==  response.data.id) {
                  this.$cookies.put('cart', response.data.id);
                }
                })
            ;
        }

        addItem(seat, match) {

            this.$http.post('/api/orders/cart', {
                seatId: seat.id,
                matchId: match.id
            })
                .then(response => {
                    this.cart.items = response.data.items;
                })
            ;
        }

        removeItem(id) {
            this.$http.delete('/api/orders/cart/items/' + id)
                .then(response => {
                    this.cart.items = response.data.items;
                })
            ;
        }

        convertCartToOrderAsUser() {
            return this.convertCartToOrder(this.Auth.getCurrentUser());
        }

        convertCartToOrderAsGuest(guest) {
            this.$cookies.put('guest', guest.email);

            return this.convertCartToOrder(guest);
        }

        convertCartToOrder(user) {
            return this.$http.post('/api/orders/cart/convert', {user: user});
        }

    }

    angular.module('metalistTicketsApp')
        .service('CartService', CartService);
})();
