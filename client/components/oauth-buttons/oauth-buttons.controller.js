'use strict';

angular.module('metalistTicketsApp')
    .controller('OauthButtonsCtrl', function ($window) {
        this.loginOauth = function (provider) {
            $window.location.href = '/auth/' + provider;
        };
    });
