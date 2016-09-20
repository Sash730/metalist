'use strict';

(function () {

    class MatchSeatsController {

        constructor($http, $state, $stateParams) {
            this.$http = $http;
            this.seats = [];
            this.match = {};


            $http.get('/api/matches/' + $stateParams.id)
                .then(response => {
                    this.match = response.data;

                    return  this.match._id;
                })
                .then((id) => {
                    return $http.get('/api/matches/' + id + '/seats');
                })
                .then(response => {
                    this.seats = response.data;
                })
                .catch(error => {
                    console.error(error);
                    $state.go('404');
                })
                .then(() => {
                    console.log(this.match, this.seats);
                })
            ;

        }
    }

    angular.module('metallistTicketsApp')
        .controller('MatchSeatsController', MatchSeatsController);
})();
