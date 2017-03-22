'use strict';

(function () {

  class DaysSummaryController {

    constructor() {
      this.statistics = [];
    }

    $onInit() {

    }

    $onChanges(changes) {
      if (changes.daysStatistics) {
        if (!this.daysStatistics.length) {
         this.statistics = [];
        }
        if (this.daysStatistics.length) {
          this.statistics = this.daysStatistics;
        }
      }
    }
  }

  angular.module('metalistTicketsApp.admin')
    .controller('DaysSummaryController', DaysSummaryController);
})();
