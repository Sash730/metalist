'use strict';

(function () {

  angular.module('metalistTicketsApp.admin')
    .component('abonementForm', {
      templateUrl: 'app/admin/season-ticket/abonement-form/abonement-form.html',
      controller: 'AbonementFormController',
      bindings: {
        seasonTicketToEdit: '<',
        message: '<',
        onEdit: '&',
        onChange: '&'
      }
    });
})();
