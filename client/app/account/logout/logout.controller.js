'use strict';

class LogoutController {

  constructor($state, $http, Auth, CartService) {
    this.Auth = Auth;
    this.$http = $http;
    this.$state = $state;
    this.loadCart = CartService.loadCart.bind(CartService);

    this.Auth.logout();
    this.logoutSession();
  }

  logoutSession() {
    return this.$http.get('/auth/local/logout')
      .then(() => {
        this.loadCart();

        this.$state.go('main.matches');
      })
      .catch((error) => {
        console.log(error);
        this.$state.go('404');
      });
  }
}

angular.module('metalistTicketsApp')
  .controller('LogoutController', LogoutController);
