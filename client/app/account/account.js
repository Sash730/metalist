'use strict';

angular.module('metalistTicketsApp')
    .config(function ($stateProvider) {
        $stateProvider.state('login', {
            url: '/login?referrer',
            referrer: 'main.home',
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
    .run(function ($rootScope, $window) {

        $rootScope.$on('$stateChangeStart', function (event, next, nextParams,  prev, prevParams) {

            if (next.name === 'login' && prev && prev.name && !prev.authenticate) {
              next.referrer = prev.name;
              next.params = prevParams;
              $window.sessionStorage.href = $window.location.href;
            }

          if ($window.location.hash && $window.location.hash == '#_=_') {
            $window.location.hash = '';
            event.preventDefault();
            $window.location.href = $window.sessionStorage.href;
          }
        });
    });
