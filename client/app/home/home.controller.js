'use strict';

(function () {

  class MatchesController {

    constructor($http, MatchEditorService) {
      this.$http = $http;
      this.matchEditorService = MatchEditorService;
      this.matches = [];

      this.loadMatches();
    }

    loadMatches() {
      return this.matchEditorService.loadNextMatches()
        .then( matches => {
          this.matches = matches;
          this.matches.forEach(match => {
            if (match.date) {
              match.formattedDate = moment(match.date).locale('ru').tz('Europe/Kiev').format('DD MMMM YYYY');
              match.time = moment(match.date).tz('Europe/Kiev').format('HH:mm');
            }
          });
        });
    }

  }

  angular.module('metalistTicketsApp')
    .controller('MatchesController', MatchesController);
})();
