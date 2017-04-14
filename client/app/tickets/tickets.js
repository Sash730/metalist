'use strict';

angular.module('metalistTicketsApp')
  .config(function ($stateProvider) {
    $stateProvider.state('tickets', {
      url: '/my/tickets',
      templateUrl: 'app/tickets/tickets.html',
      controller: 'TicketsController',
      controllerAs: 'vm',
    });
  });
