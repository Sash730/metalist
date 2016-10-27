'use strict';

(function () {

    function MatchesResource($resource) {
        return $resource('/api/matches/:id/:controller', {
          id: '@_id'
        }, {
          get: {
            method: 'GET'
          }
        });
    }

    angular.module('metalistTicketsApp.auth')
        .factory('Matches', MatchesResource);
})();
