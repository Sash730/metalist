'use strict';

(function () {

  angular.module('metalistTicketsApp.admin')
    .component('blockRowForm', {
      templateUrl: 'app/admin/season-ticket/block-row-form/block-row-form.html',
      controller: 'BlockRowFormController',
      bindings: {
        errorMessage: '<',
        onAdd: '&'
      }
    });
})();
