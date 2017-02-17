'use strict';

angular.module('metalistTicketsApp')
    .config(function ($stateProvider) {
        $stateProvider.state('match', {
            url: '/match/:id/sectors',
            templateUrl: 'app/match/match.html',
            controller: 'MatchController',
            controllerAs: 'vm',

            resolve: {
                match: (MatchService, $stateParams, $state) => {
                    return MatchService
                        .fetchMatch($stateParams.id)
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
