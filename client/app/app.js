'use strict';

angular.module('metallistTicketsApp', ['metallistTicketsApp.auth', 'metallistTicketsApp.admin',
    'metallistTicketsApp.constants', 'ngCookies', 'ngResource', 'ngSanitize', 'ui.router',
    'ui.bootstrap', 'validation.match'
])
    .config(function ($urlRouterProvider, $locationProvider) {
        $urlRouterProvider.otherwise('/404');

        $locationProvider.html5Mode(true);
    });
