'use strict';

(function () {

  function cartInterceptor( $cookies ) {

    return {
      request: function (config) {
        if ($cookies.get('cart')) {
          config.headers.cart = $cookies.get('cart');
        }
        return config;
      }
    }
  }

  angular.module('metalistTicketsApp.cart')
    .factory('cartInterceptor', cartInterceptor);
})();