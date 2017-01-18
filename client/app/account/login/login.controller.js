'use strict';

class LoginController {
    constructor(Auth, $state, CartService) {
        this.user = {};
        this.errors = '';
        this.submitted = false;

        this.Auth = Auth;
        this.$state = $state;
        this.CartService = CartService;
        this.referrer = $state.params.referrer || $state.current.referrer || 'main';
    }

    login(form) {
        this.submitted = true;

        if (form.$valid) {
            this.Auth.login({
                email: this.user.email,
                password: this.user.password
            })
                .then(() => {
                    //get user`s cart
                    this.CartService.loadCart();
                    // Logged in, redirect to home
                    this.$state.go(this.referrer);
                })
                .catch(err => {
                    this.errors = err.message;
                });
        }
    }
}

angular.module('metalistTicketsApp')
    .controller('LoginController', LoginController);
