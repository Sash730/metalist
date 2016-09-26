'use strict';

angular.module('metallistTicketsApp')
    .config(function ($stateProvider) {
        $stateProvider.state('main', {
            url: '/',
            controller: 'MainController',
            templateUrl: 'app/main/main.html',
            controllerAs: 'vm',
            resolve: {
                temp: () => {
                    return {a: 1};
                }
            }
        });
    });
