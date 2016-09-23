'use strict';

(function () {

    class OrderService {

        constructor($http) {
            this.$http = $http;
        }

        findOrderByNumber(orderNumber) {
            return this.$http.get('/api/orders/by-number/' + orderNumber)
                .then(response => response.data)
            ;
        }

    }

    angular.module('metallistTicketsApp')
        .service('OrderService', OrderService);
})();
