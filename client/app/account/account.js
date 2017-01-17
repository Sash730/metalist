'use strict';

angular.module('metalistTicketsApp')
    .config(function ($stateProvider) {
        $stateProvider.state('login', {
            url: '/login?referrer',
            referrer: 'main',
            templateUrl: 'app/account/login/login.html',
            controller: 'LoginController',
            controllerAs: 'vm'
        })
            .state('logout', {
                url: '/logout',
                template: '',
                controller: 'LogoutController'
            })
            .state('signup', {
                url: '/signup',
                templateUrl: 'app/account/signup/signup.html',
                controller: 'SignupController',
                controllerAs: 'vm'
            })
            .state('recovery', {
              url: '/recovery',
              templateUrl: 'app/account/recovery/recovery.html',
              controller: 'RecoveryController',
              controllerAs: 'vm'
            })
            .state('settings', {
                url: '/settings',
                templateUrl: 'app/account/settings/settings.html',
                controller: 'SettingsController',
                controllerAs: 'vm',
                authenticate: true
            });
    })
    .run(function ($rootScope) {
        $rootScope.$on('$stateChangeStart', function (event, next, nextParams, current) {
            if (next.name === 'login' && current && current.name && !current.authenticate) {
                next.referrer = current.name;
            }
        });
    });
