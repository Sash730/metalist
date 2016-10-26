'use strict';

angular.module('metalistTicketsApp')
    .directive('oauthButtons', function () {
        return {
            templateUrl: 'components/oauth-buttons/oauth-buttons.html',
            restrict: 'EA',
            controller: 'OauthButtonsCtrl',
            controllerAs: 'OauthButtons',
            scope: {
                classes: '@'
            }
        };
    });
