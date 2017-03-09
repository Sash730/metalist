'use strict';

(function () {

  angular.module('metalistTicketsApp.admin')
    .component('abonementList', {
      templateUrl: 'app/admin/season-ticket/abonement-list/abonement-list.html',
      controller: 'AbonementListController',
      bindings: {
        seasonTickets: '<',
        onChange: '&'
      }
    });
})();
