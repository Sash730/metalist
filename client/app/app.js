'use strict';

angular.module('metalistTicketsApp', ['metalistTicketsApp.auth', 'metalistTicketsApp.admin',
    'metalistTicketsApp.constants', 'ngCookies', 'ngResource', 'ngSanitize', 'ui.router',
    'ui.bootstrap', 'validation.match', 'ngPrint'
])
    .config(function ($urlRouterProvider, $locationProvider, $cookiesProvider) {
        $urlRouterProvider.otherwise('/404');

        var n = new Date();
        $cookiesProvider.defaults.expires = new Date(n.getFullYear(), n.getMonth(), n.getDate(), n.getHours()+6);

        $locationProvider.html5Mode(true);
    });
