'use strict';

(function () {

  class MatchEditorController {

    constructor(MatchEditorService, PriceSchemaService) {
      this.matchEditorService = MatchEditorService;
      this.priceSchemaService = PriceSchemaService;

      this.matches = [];
      this.priceSchemas = [];
      this.matchToEdit = {};
      this.matchId = '';
    }

    $onInit() {
      this.loadPriceSchemas();
      this.loadMatches();
    }

    edit(match) {
      this.matchToEdit = Object.assign({}, match);
    }

    remove() {
      this.deleteMatch(this.matchId);
      this.edit({});
    }

    onMatchUpdate(event) {
      if (event.match.id) {
        this.saveMatch(event.match);
      } else {
        this.addMatch(event.match);
      }
      this.edit({});
    }

    loadPriceSchemas() {
      return this.priceSchemaService.loadPrices()
        .then( response => this.priceSchemas = response.data );
    }

    loadMatches() {
      return this.matchEditorService.loadMatches()
        .then( mathces => this.matches = mathces );
    }

    deleteMatch(matchId) {
      return this.matchEditorService.deleteMatch(matchId)
        .then(() => this.loadMatches());
    }

    addMatch(match) {
      this.matchEditorService.createMatch(match)
        .then(() => this.loadMatches());
    }

    saveMatch(match) {
      this.matchEditorService.editMatch(match)
        .then(() => this.loadMatches());
    }

  }

  angular.module('metalistTicketsApp.admin')
    .controller('MatchEditorController', MatchEditorController);
})();
