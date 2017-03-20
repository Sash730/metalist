'use strict';

(function () {

  class EventsSummaryController {

    constructor() {
      this.statistics = [];
    }

    $onInit() {
    }

    $onChanges(changes) {
      if (changes.eventsStatistics) {
        if (!this.eventsStatistics.length) {
          this.statistics = [];
        }
        if (this.eventsStatistics.length) {
          this.statistics = this.eventsStatistics;
        }
      }
    }
  }

  angular.module('metalistTicketsApp.admin')
    .controller('EventsSummaryController', EventsSummaryController);
})();
