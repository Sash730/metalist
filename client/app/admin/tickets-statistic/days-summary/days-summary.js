'use strict';

(function () {

  angular.module('metalistTicketsApp.admin')
    .component('daysSummary', {
      templateUrl: 'app/admin/tickets-statistic/days-summary/days-summary.html',
      controller: 'DaysSummaryController',
      bindings: {
        daysStatistics: '<'
      }
    });
})();
