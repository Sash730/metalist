'use strict';

(function () {

    class OrderDetailsController {

        constructor(OrdersService, $stateParams, $timeout) {
          this.ordersService = OrdersService;
          this.orderNumber = $stateParams.orderNumber;
          this.$timeout = $timeout;
          this.order = {};
          this.tickets = [];
          this.message = '';
          this.counter = 0;

          this.getOrderByNumber();
        }

        getOrderByNumber() {
          this.ordersService.findOrderByNumber(this.orderNumber)
            .then(order => {
              this.order = order;

              if ( this.order.statusPaid ) {
                this.getTicketsInOrder(order);
              }
              this.getMessageForOrderStatus();
            });
        }

        getTicketsInOrder(order) {
          return this.ordersService.getOrderedTickets(order)
            .then( tickets => this.tickets = tickets );
        }

        getMessageForOrderStatus() {
        let timer;

          if ( this.order.statusPaid  || this.order.statusFailed ) {
            this.message =  '';
            this.$timeout.cancel(timer);
          } else {

            if ( this.counter > 10 ) {
              this.message =  'Something went wrong...';
              this.$timeout.cancel(timer);
            } else {
              this.message = 'Идет обработка запроса от LiqPay.';
              this.counter++;
              timer = this.$timeout(this.getOrderByNumber.bind(this), 5000);
            }
          }
        }

    }


    angular.module('metalistTicketsApp')
        .controller('OrderDetailsController', OrderDetailsController);
})();
