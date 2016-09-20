'use strict';

(function () {

    class MatchSeatsService {

        constructor($http) {
            this.$http = $http;
        }

        fetchMatch(id) {
            return this.$http.get('/api/matches/' + id)
                .then(response => response.data)
            ;
        }

        fetchMatchSeats(id) {
            return this.$http.get('/api/matches/' + id + '/seats')
                .then(response => response.data)
            ;
        }
    }

    angular.module('metallistTicketsApp')
        .service('MatchSeatsService', MatchSeatsService);
})();
