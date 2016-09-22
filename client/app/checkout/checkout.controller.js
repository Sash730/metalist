'use strict';

(function () {

    class CheckoutController {

        constructor(CartService, Auth) {
            this.cart = CartService;
            this.isLoggedIn = Auth.isLoggedIn;
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
                this.cart.convertCartToOrderAsGuest(user);
            }
        }

        checkout() {
            this.cart.convertCartToOrderAsUser();
        }
    }

    angular.module('metallistTicketsApp')
        .controller('CheckoutController', CheckoutController);
})();
