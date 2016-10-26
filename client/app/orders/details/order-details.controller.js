'use strict';

(function () {

    class OrderDetailsController {

        constructor(order, tickets) {
            this.order = order;
            this.tickets = tickets;
        }
    }

    angular.module('metalistTicketsApp')
        .controller('OrderDetailsController', OrderDetailsController);
})();
