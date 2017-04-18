'use strict';

angular.module('metalistTicketsApp')
    .config(function ($stateProvider) {
        $stateProvider.state('main.checkout', {
          url: '/checkout',
          templateUrl: 'app/checkout/checkout.html',
          controller: 'CheckoutController',
          controllerAs: 'vm'
        });
    });
