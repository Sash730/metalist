'use strict';

(function () {

  class MatchEditorController {

    constructor(MatchEditorService, PriceSchemaService) {
      this.matchEditorService = MatchEditorService;
      this.priceSchemaService = PriceSchemaService;

      this.nextMatches = [];
      this.prevMatches = [];
      this.priceSchemas = [];
      this.matchToEdit = {};
      this.matchId = '';
      this.message = '';
    }

    $onInit() {
      this.loadPriceSchemas();
      this.loadMatches();
    }

    loadMatches() {
      this.loadNextMatches();
      this.loadPrevMatches();
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
        this.message = 'Процесс создания сидений для матча запущен. Это может занять 5-10 минут. ' +
          'При успешном создании появится дата матча на домашней странице.';
      }
      this.edit({});
    }

    loadPriceSchemas() {
      return this.priceSchemaService.loadPrices()
        .then( response => this.priceSchemas = response.data );
    }

    loadNextMatches() {
      this.matchId = '';
      return this.matchEditorService.loadNextMatches()
        .then( matches => this.nextMatches = matches );
    }

    loadPrevMatches() {
      this.matchId = '';
      return this.matchEditorService.loadPrevMatches()
        .then( matches => this.prevMatches = matches );
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
