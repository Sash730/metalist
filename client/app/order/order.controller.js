'use strict';

(function () {

    class OrderController {

        constructor(order) {
            this.order = order;
            console.log(order);
        }
    }

    angular.module('metallistTicketsApp')
        .controller('OrderController', OrderController);
})();
