'use strict';

(function () {

    class MainController {

        constructor($http) {
            this.$http = $http;
            this.matches = [];
        }

        $onInit() {
            this.$http.get('/api/matches')
                .then((response) => {
                    this.matches = response.data;
                })
        }
    }

    angular.module('metallistTicketsApp')
        .component('main', {
            templateUrl: 'app/main/main.html',
            controller: MainController
        });
})();
