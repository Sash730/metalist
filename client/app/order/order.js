'use strict';

angular.module('metallistTicketsApp')
    .config(function ($stateProvider) {
        $stateProvider.state('my_order', {
            url: '/my/orders/:orderNumber',
            templateUrl: 'app/order/order.html',
            controller: 'OrderController',
            controllerAs: 'vm',
            resolve: {
                order: ($stateParams, $state, OrderService) => {
                    return OrderService.findOrderByNumber($stateParams.orderNumber)
                        .catch((error) => {
                            console.log(error);
                            $state.go('404');
                        });
                }
            }
        });
    });
