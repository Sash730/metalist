'use strict';

(function () {

  class TicketsStatisticController {
    constructor(TicketsService) {
      this.ticketsService = TicketsService;

      this.eventsStatistics = [];
      this.daysStatistics = [];
    }

    $onInit() {
      this.getEventsStatistics();
      this.getDaysStatistics()
    }

    getEventsStatistics() {
      this.ticketsService.getEventsStatistics()
        .then(statistic => {
          this.eventsStatistics = statistic;
        });
    }

    getDaysStatistics() {
      this.ticketsService.getDaysStatistics()
        .then(statistic => this.daysStatistics = statistic );
    }
  }

  angular.module('metalistTicketsApp.admin')
    .controller('TicketsStatisticController', TicketsStatisticController);
})();
