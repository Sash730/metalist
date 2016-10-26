'use strict';

(function () {

    class NotFoundController {

        constructor($http) {
            this.$http = $http;
            this.matches = [];
        }
    }

    angular.module('metalistTicketsApp')
        .controller('404Controller', NotFoundController);
})();
