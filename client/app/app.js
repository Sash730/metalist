'use strict';

angular.module('metalistTicketsApp', ['metalistTicketsApp.auth', 'metalistTicketsApp.admin',
  'metalistTicketsApp.cart','metalistTicketsApp.constants', 'ngCookies', 'ngResource',
  'ngSanitize', 'ui.router', 'ui.bootstrap', 'validation.match', 'ngPrint'
])
    .config(function ($urlRouterProvider, $locationProvider) {
        $urlRouterProvider.otherwise('/404');

        $locationProvider.html5Mode(true);
    });
