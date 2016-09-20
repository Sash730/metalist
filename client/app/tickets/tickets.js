'use strict';

angular.module('metallistTicketsApp')
    .config(function ($stateProvider) {
        $stateProvider.state('match-seats', {
            url: '/match/:id/seats',
            templateUrl: 'app/tickets/match-seats.html',
            controller: 'MatchSeatsController',
            controllerAs: 'controller',
        });
    });
