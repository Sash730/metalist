'use strict';

(function () {

    class NotFoundController {

        constructor($http) {
            this.$http = $http;
            this.matches = [];
        }
    }

    angular.module('metallistTicketsApp')
        .controller('404Controller', NotFoundController);
})();
