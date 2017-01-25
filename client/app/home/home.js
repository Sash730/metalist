'use strict';

angular.module('metalistTicketsApp')
    .config(function ($stateProvider) {
        $stateProvider.state('main.home',{
            url: '',
            controller: 'MatchesController',
            templateUrl: 'app/home/home.html',
            controllerAs: 'vm',
        });
    });
