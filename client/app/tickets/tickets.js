'use strict';

angular.module('metallistTicketsApp')
    .config(function ($stateProvider) {
        $stateProvider.state('match-seats', {
            url: '/match/:id/seats',
            templateUrl: 'app/tickets/match-seats.html',
            controller: 'MatchSeatsController',
            controllerAs: 'controller',

            resolve: {
                match: (MatchSeatsService, $stateParams, $state) => {
                    return MatchSeatsService
                        .fetchMatch($stateParams.id)
                        .catch((error) => {
                            $state.go('404');
                        })
                    ;
                },
                seats: (MatchSeatsService, $stateParams, $state) => {
                    return MatchSeatsService.fetchMatchSeats($stateParams.id)
                        .catch((error) => {
                            $state.go('404');
                        })
                    ;
                }
            }
        });
    });
