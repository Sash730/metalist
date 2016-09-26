'use strict';

(function () {

    class MainController {

        constructor($http, temp) {
            this.$http = $http;
            this.matches = [];

            this.$http.get('/api/matches')
                .then((response) => {
                    this.matches = response.data;
                });

            console.log('main', temp);
        }

    }

    angular.module('metallistTicketsApp')
        .controller('MainController', MainController);
})();
