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
          this.$cookies.put('cart', response.data.publicId);

          return this.cart;
        });
    }

    getCart() {
      return this.$http.get('/api/carts')
        .then(response => {
            this.cart.seats = response.data.seats;

            return this.cart;
          },
          error => this.createCart() );
    }

    addSeatToCart(slug) {
      return this.$http.post('/api/carts/addSeat', {slug: slug})
        .then(response => {
          this.cart.seats = response.data.seats;

          if (response.data.message) {
            return response.data.message;
          }
        });
    }

    removeSeatFromCart(slug) {
      return this.$http.delete('/api/carts/seat/' + slug)
        .then(response => {
          this.cart.seats = response.data.seats;
        });
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
