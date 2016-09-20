'use strict';

angular.module('metallistTicketsApp')
    .config(function ($stateProvider) {
        $stateProvider.state('404', {
            url: '/404',
            templateUrl: 'app/404/404.html',
            controller: '404Controller',
            controllerAs: 'controller',
        });
    });
