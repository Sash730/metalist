'use strict';

(function () {

    class MatchesController {

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
        .controller('MatchesController', MatchesController);
})();
