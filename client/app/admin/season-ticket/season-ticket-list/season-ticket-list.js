'use strict';

(function () {

  angular.module('metalistTicketsApp.admin')
    .component('seasonTicketList', {
      templateUrl: 'app/admin/season-ticket/season-ticket-list/season-ticket-list.html',
      controller: 'SeasonTicketListController',
      bindings: {
        seasonTickets: '<'
      }
    });
})();
