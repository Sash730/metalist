'use strict';

(function () {

    class CheckoutController {

        constructor($window, CartService, Auth) {
            this.$window = $window;
            this.cart = CartService;
            this.isLoggedIn = Auth.isLoggedIn;

            // console.log('checkout', temp);
        }

        addToCart(seat) {
            this.cart.addItem(seat, this.match);
        }
        getTotalItems() {
            return this.cart.getTotalItems();
        }

        checkoutAsGuest(form, user) {
            form.$setDirty();
            form.email.$setDirty();
            form.name.$setDirty();

            if(form.$valid) {
                this.handleCheckoutResponse(this.cart.convertCartToOrderAsGuest(user));
            }
        }

        checkout() {
            this.handleCheckoutResponse(this.cart.convertCartToOrderAsUser());
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
