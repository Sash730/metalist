'use strict';

(function () {

  class TicketsStatisticController {
    constructor(TicketsService, MatchEditorService) {
      this.ticketsService = TicketsService;
      this.matchEditorService = MatchEditorService;

      this.statistic = {};
      this.matches = [];
    }

    $onInit() {
      this.loadMatches();
    }

    loadMatches() {
      return this.matchEditorService.loadMatches().then(mathces => this.matches = mathces)
    }

    getStatisticForTickets(date) {
      this.ticketsService.getCountPaidTickets(date)
        .then(statistic => { this.statistic = statistic; });
    }

  }

  angular.module('metalistTicketsApp.admin')
    .controller('TicketsStatisticController', TicketsStatisticController);
})();
