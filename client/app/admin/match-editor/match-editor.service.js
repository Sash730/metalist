'use strict';

(function () {

  class MatchEditorService {

    constructor($http) {
      this.$http = $http;

    }

    loadMatches() {
      return this.$http.get('/api/matches/')
        .then(response => response.data);
    }

    createMatch(match) {
      return this.$http({
        method: 'POST',
        url: '/api/matches',
        data: match,
        headers: {'Accept': 'application/json'}
      });
    }

  }

  angular.module('metalistTicketsApp.admin')
    .service('MatchEditorService', MatchEditorService);

})();
