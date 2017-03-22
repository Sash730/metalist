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
        .then(statistic => this.daysStatistics = this.makeStatisticsForDays(statistic) );
    }

    makeStatisticsForDays(statistic) {
      let responses = [];
      statistic.forEach(day => {
        let key = day.date,
            response = responses[key];

        if (!response) {
          response = responses[key] = [];
        }
        response.push( day.amount );
      });
      responses.map(day  => {

      });

      console.log(responses);
    }
  }

  angular.module('metalistTicketsApp.admin')
    .controller('TicketsStatisticController', TicketsStatisticController);
})();
