'use strict';

angular.module('metalistTicketsApp.auth', ['metalistTicketsApp.constants',
    'metalistTicketsApp.util', 'ngCookies', 'ui.router'
])
    .config(function ($httpProvider) {
        $httpProvider.interceptors.push('authInterceptor');
    });
