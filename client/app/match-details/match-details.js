'use strict';

(function () {

  angular.module('metalistTicketsApp')
    .component('main.matchDetails', {
      templateUrl: 'app/match-details/match-details.html',
      controller: 'MatchDetailsController',
      bindings: {
        match: '<'
      }
    });
})();

