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

            this.getCart();
        }

      getCart() {
        this.cartService.loadCart().then(cart => {
          this.cart = cart;
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
