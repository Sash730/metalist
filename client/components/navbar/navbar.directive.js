'use strict';

angular.module('metalistTicketsApp')
    .directive('navbar', () => ({
        templateUrl: 'components/navbar/navbar.html',
        restrict: 'E',
        controller: 'NavbarController',
        controllerAs: 'nav'
    }));
