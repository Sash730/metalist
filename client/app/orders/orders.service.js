'use strict';

(function () {

    class OrdersService {

        constructor($http) {
            this.$http = $http;
        }

        findOrderByNumber(orderNumber) {
            return this.$http.get('/api/orders/by-number/' + orderNumber)
                .then(response => response.data)
            ;
        }

        findMyOrders(orderNumber) {
            return this.$http.get('/api/orders/my')
                .then(response => response.data)
            ;
        }

    }

    angular.module('metallistTicketsApp')
        .service('OrdersService', OrdersService);
})();
