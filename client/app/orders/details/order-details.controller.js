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
            })
        }

        getTicketsInOrder(order) {
          return this.ordersService.getOrderedTickets(order)
            .then( tickets => this.tickets = tickets )
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

      printTicket(printSectionId) {
        let innerContents = document.getElementById(printSectionId).innerHTML,
          popupInWindow = window.open('', '_blank','width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');

        popupInWindow.document.open();
        popupInWindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head><body onload="window.print()">' + innerContents + '</html>');
        popupInWindow.document.close();
      }
    }

    angular.module('metalistTicketsApp')
        .controller('OrderDetailsController', OrderDetailsController);
})();
