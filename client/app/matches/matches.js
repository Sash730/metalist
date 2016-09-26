'use strict';

angular.module('metallistTicketsApp')
    .config(function ($stateProvider) {
        $stateProvider.state('main.matches',{
            url: '',
            controller: 'MatchesController',
            templateUrl: 'app/matches/matches.html',
            controllerAs: 'vm',
        });
    });
