'use strict';

(function () {

  angular.module('metalistTicketsApp.admin')
    .component('eventsSummary', {
      templateUrl: 'app/admin/tickets-statistic/events-summary/events-summary.html',
      controller: 'EventsSummaryController',
      bindings: {
        eventsStatistics: '<'
      }
    });
})();
