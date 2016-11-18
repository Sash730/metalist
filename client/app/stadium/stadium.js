'use strict';

angular.module('metalistTicketsApp')
  .config(function ($stateProvider) {
    $stateProvider.state('stadium',{
      url: '/stadium',
      templateUrl: 'app/stadium/stadium.html',
      controller: 'StadiumController',
      controllerAs: 'vm'
    });
  });
