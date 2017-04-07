'use strict';

(function () {

  angular.module('metalistTicketsApp.admin')
    .component('blockRowList', {
      templateUrl: 'app/admin/season-ticket/block-row-list/block-row-list.html',
      controller: 'BlockRowListController',
      bindings: {
        blockRowSeats: '<',
        onDelete: '&'
      }
    });
})();
