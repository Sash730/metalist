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

    editMatch(match) {
      return this.$http({
        method: 'PUT',
        url: '/api/matches/' + match._id,
        data: match,
        headers: {'Accept': 'application/json'}
      });
    }

    deleteMatch(match) {
      return this.$http({
        method: 'delete',
        url: '/api/matches/' + match._id,
        headers: {'Accept': 'application/json'}
      });
    }

  }

  angular.module('metalistTicketsApp.admin')
    .service('MatchEditorService', MatchEditorService);

})();
