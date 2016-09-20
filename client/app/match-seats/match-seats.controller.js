'use strict';

(function () {

    class MatchSeatsController {

        constructor(match, seats) {
            this.match = match;
            this.seats = seats;
        }
    }

    angular.module('metallistTicketsApp')
        .controller('MatchSeatsController', MatchSeatsController);
})();
