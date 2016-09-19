'use strict';

(function () {

    class MainController {

        constructor($http) {
            this.$http = $http;
        }
    }

    angular.module('metallistTicketsApp')
        .component('main', {
            templateUrl: 'app/main/main.html',
            controller: MainController
        });
})();
