'use strict';

(function () {

    class StadiumController {

        constructor(place) {
            this.stadium = place.stadium;
        }
    }

    angular.module('metalistTicketsApp')
        .component('stadium', {
            templateUrl: 'app/stadium/stadium.html',
            controller: StadiumController,
            controllerAs: 'vm'
        });
})();
