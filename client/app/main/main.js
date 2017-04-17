'use strict';

angular.module('metalistTicketsApp')
    .config(function ($stateProvider) {
        $stateProvider.state('main', {
            abstract: true,
            url: '',
            template: '<ui-view />',
            resolve: {
                cart: (CartService) => {
                    return CartService.loadCart()
                      .catch((error) => {
                        console.log(error);
                      });
                }
            }
        });
    });
