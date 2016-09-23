'use strict';

(function () {

    class OrderController {

        constructor(order) {
            this.order = order;
        }
    }

    angular.module('metallistTicketsApp')
        .controller('OrderController', OrderController);
})();
