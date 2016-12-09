'use strict';

(function () {

    class CartService {

        constructor($http, Auth, $cookies) {
            this.$http = $http;
            this.Auth = Auth;
            this.$cookies = $cookies;
            this.cart = new Cart();
            this.message = '';

            this.loadCart();
        }

        loadCart() {
            this.$http.get('/api/orders/cart')
                .then(response => {
                    this.cart.tickets = response.data.tickets;

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
                  if (response.data.message) {
                    this.message = response.data.message;
                    console.log(this.message);
                  } else {
                    this.cart.tickets = response.data.tickets;
                  }
                })
            ;
        }

        removeItem(id) {
            this.$http.delete('/api/orders/cart/tickets/' + id)
                .then(response => {
                    this.cart.tickets = response.data.tickets;
                })
            ;
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

    angular.module('metalistTicketsApp')
        .service('CartService', CartService);
})();
