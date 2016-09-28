'use strict';

(function () {

    class OrderDetailsController {

        constructor(order) {
            this.order = order;
        }
    }

    angular.module('metallistTicketsApp')
        .controller('OrderDetailsController', OrderDetailsController);
})();
