'use strict';

(function () {

  angular.module('metalistTicketsApp.admin')
    .component('editor', {
      templateUrl: 'app/admin/match-editor/editor/editor.html',
      controller: 'EditorController',
      bindings: {
        matchToEdit: '<',
        priceSchemas: '<',
        onChange: '&'
      }
    });
})();

