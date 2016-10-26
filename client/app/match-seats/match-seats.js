'use strict';

angular.module('metalistTicketsApp')
    .config(function ($stateProvider) {
        $stateProvider.state('match-seats', {
            url: '/match/:id/seats',
            templateUrl: 'app/match-seats/match-seats.html',
            controller: 'MatchSeatsController',
            controllerAs: 'vm',

            resolve: {
                match: (MatchSeatsService, $stateParams, $state) => {
                    return MatchSeatsService
                        .fetchMatch($stateParams.id)
                        .catch((error) => {
                            console.log(error);
                            $state.go('404');
                        })
                    ;
                },
                seats: (MatchSeatsService, $stateParams, $state) => {
                    return MatchSeatsService.fetchMatchSeats($stateParams.id)
                        .catch((error) => {
                            console.log(error);
                            $state.go('404');
                        })
                    ;
                },
                cart: (CartService) => {
                    return CartService.cart;
                }
            }
        });
    });
