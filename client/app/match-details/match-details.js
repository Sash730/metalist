'use strict';

(function () {

  angular.module('metalistTicketsApp')
    .component('matchDetails', {
      templateUrl: 'app/match-details/match-details.html',
      controller: 'MatchDetailsController',
      bindings: {
        match: '<'
      }
    });
})();

