'use strict';

(function () {

    class MainController {

        constructor($http, temp, contacts) {
            this.$http = $http;
            this.matches = [];

            this.$http.get('/api/matches')
                .then((response) => {
                    this.matches = response.data;
                });

            console.log('main', temp);
            console.log('main', contacts.all());
        }

    }

    angular.module('metallistTicketsApp')
        .controller('MainController', MainController);
})();
