'use strict';

(function () {

    class OrdersController {

        constructor(orders) {
            this.orders = orders;
        }
    }

    angular.module('metallistTicketsApp')
        .controller('OrdersController', OrdersController);
})();
