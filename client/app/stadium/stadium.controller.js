'use strict';

(function () {

  class StadiumController {

    constructor($http) {
      this.$http = $http;
    }
  }

  angular.module('metalistTicketsApp')
    .controller('StadiumController', StadiumController);
})();
