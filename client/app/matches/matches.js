'use strict';

angular.module('metalistTicketsApp')
    .config(function ($stateProvider) {
        $stateProvider.state('main.matches',{
            url: '',
            controller: 'MatchesController',
            templateUrl: 'app/matches/matches.html',
            controllerAs: 'vm',
        });
    });
