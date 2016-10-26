'use strict';

(function () {

    class OrdersController {

        constructor(orders) {
            this.orders = orders;
        }
    }

    angular.module('metalistTicketsApp')
        .controller('OrdersController', OrdersController);
})();
