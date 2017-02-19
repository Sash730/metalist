'use strict';

(function () {

  class TicketsStatisticController {
    constructor(AdminService, MatchEditorService) {
      this.adminService = AdminService;
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
      this.adminService.getCountPaidTickets(date)
        .then(statistic => { this.statistic = statistic; });
    }

  }

  angular.module('metalistTicketsApp.admin')
    .controller('TicketsStatisticController', TicketsStatisticController);
})();
