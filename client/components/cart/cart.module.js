'use strict';

angular.module('metalistTicketsApp.cart', [ 'ngCookies', 'ui.router'])
  /*.run( function($http, $cookies) {
    $http.defaults.headers.post['cart'] = $cookies.cart;
  })*/

  .config(function ($httpProvider, $cookiesProvider) {
    $httpProvider.interceptors.push('cartInterceptor');
    //$httpProvider.defaults.withCredentials = true;

    var n = new Date();
    $cookiesProvider.defaults.path = '/';
    //$cookiesProvider.defaults.domain = location.hostname;
    //$cookiesProvider.defaults.secure = true;
    $cookiesProvider.defaults.expires = new Date(n.getFullYear()+1, n.getMonth(), n.getDate());
  });
