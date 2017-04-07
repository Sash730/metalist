'use strict';

(function () {

  angular.module('metalistTicketsApp.admin')
    .component('seasonTicketForm', {
      templateUrl: 'app/admin/season-ticket/season-ticket-form/season-ticket-form.html',
      controller: 'SeasonTicketFormController',
      bindings: {
        errorMessage: '<',
        onChange: '&'
      }
    });
})();
