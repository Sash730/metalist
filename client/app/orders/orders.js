'use strict';

angular.module('metallistTicketsApp')
    .config(function ($stateProvider) {
        $stateProvider.state('orders', {
            url: '/my/orders',
            templateUrl: 'app/orders/orders.html',
            controller: 'OrdersController',
            controllerAs: 'vm',
            resolve: {
                orders: ($state, OrdersService) => {

                    return OrdersService.findMyOrders()
                        .catch((error) => {
                            console.log(error);
                            $state.go('404');
                        });

                }
            }
        }).state('order-details', {
            url: '/my/orders/:orderNumber',
            templateUrl: 'app/orders/details/order-details.html',
            controller: 'OrderDetailsController',
            controllerAs: 'vm',
            resolve: {
                order: ($stateParams, $state, OrdersService) => {
                    console.log('resolve order');
                    return OrdersService.findOrderByNumber($stateParams.orderNumber)
                        .catch((error) => {
                            console.log(error);
                            $state.go('404');
                        });
                },
                tickets: ($state, OrdersService, order) => {
                    console.log('resolve tickets', order);
                    if(order.statusPaid) {
                        return OrdersService.getOrderedTickets(order)
                            .catch((error) => {
                                console.log(error);
                                $state.go('404');
                            });
                    } else {
                        return [];
                    }
                },
            }
        });
    });
