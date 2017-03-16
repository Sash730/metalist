'use strict';

(function () {

    class CheckoutController {

        constructor($window, CartService, Auth) {
            this.$window = $window;
            this.cartService = CartService;
            this.cart = {};
            this.Auth = Auth;
            this.isLoggedIn = Auth.isLoggedIn;

            this.confirm = false;
            this.message = '';
            this.reserveDate = '';

            this.getCart();
        }

        getCart() {
          this.cartService.loadCart().then(cart => {
            this.cart = cart;
            this.getReserveDateFromTickets();
          });
        }

        confirmEmail(form, user) {
          form.$setDirty();
          form.email.$setDirty();

          let email =  user.email;

          if(form.$valid) {
            this.Auth.generateGuestPassword(email)
              .then((response) => {
                this.confirm = true;
                this.message = response.message;
              })
              .catch(err => {
                this.confirm = false;
                this.message = err.message;
              });
          }
        }

        guestLogin(form, user) {
            form.$setDirty();
            form.email.$setDirty();
            form.password.$setDirty();

            if(form.$valid) {
              this.Auth.login({
                email: user.email,
                password: user.password
              })
                .catch(err => {
                  this.errors.other = err.message;
                });
            }
        }

      getReserveDateFromTickets() {
        if( !this.cart.tickets.length ) {
          this.reserveDate = '';
          return;
        }
        if( this.cart.tickets.length > 1 ) {
          this.cart.tickets.sort((a,b) => b.reserveDate - a.reserveDate);
        }
        this.reserveDate = this.cart.tickets[0].reserveDate;

      };

        updateCart () {
          this.getReserveDateFromTickets();
        }

        checkout() {
            this.handleCheckoutResponse(this.cartService.convertCartToOrderAsUser());
        }

        handleCheckoutResponse(responsePromise) {
            responsePromise.then(response => {
                this.$window.location.href=response.data.paymentLink;
            });
        }
    }

    angular.module('metalistTicketsApp')
        .controller('CheckoutController', CheckoutController);
})();
