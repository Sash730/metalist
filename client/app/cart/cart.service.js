'use strict';

(function () {

    class CartService {

        constructor($http, Auth, $cookies) {
            this.$http = $http;
            this.Auth = Auth;
            this.$cookies = $cookies;
            this.cart = new Cart();

          this.loadCart();
        }

        loadCart() {
          if (this.$cookies.get('cart')) {
            return this.getCart();
          }
          return this.createCart();
        }

        createCart() {
          return this.$http.post('/api/carts')
            .then(response => {
              this.cart.tickets = response.data.tickets;

              if (this.$cookies.get('cart') !==  response.data.publicId) {
                this.$cookies.put('cart', response.data.publicId);
              }

              return this.cart;
            });
        }

        getCart() {
          return this.$http.get('/api/carts/cart/' + this.$cookies.get('cart') )
            .then(response => {
              this.cart.tickets = response.data.tickets;

              return this.cart;
            },
            error => this.createCart() );
        }

        addTicket(match, tribuneName, sectorName, rowName, seat, price) {
            return this.$http.post('/api/orders/cart', {
                match: match,
                tribuneName: tribuneName,
                sectorName: sectorName,
                rowName: rowName,
                seat: seat,
                price: price
            })
                .then(response => {
                  this.cart.tickets = response.data.tickets;
                  if (response.data.message) {
                    return response.data.message;
                  }
                })
            ;
        }

        removeTicket(seatId) {
            return this.$http.delete('/api/orders/cart/tickets/' + seatId)
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
