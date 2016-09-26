'use strict';

(function () {

    class CheckoutController {

        constructor($window, CartService, Auth) {
            this.$window = $window;
            this.cart = CartService.cart;
            this.cartService = CartService;
            this.isLoggedIn = Auth.isLoggedIn;
        }

        checkoutAsGuest(form, user) {
            form.$setDirty();
            form.email.$setDirty();
            form.name.$setDirty();

            if(form.$valid) {
                this.handleCheckoutResponse(this.cartService.convertCartToOrderAsGuest(user));
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

    angular.module('metallistTicketsApp')
        .controller('CheckoutController', CheckoutController);
})();
