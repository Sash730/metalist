'use strict';

angular.module('metalistTicketsApp')
  .config(function ($stateProvider) {
    $stateProvider.state('tickets', {
      url: '/my/tickets',
      templateUrl: 'app/tickets/tickets.html',
      controller: 'TicketsController',
      controllerAs: 'vm',
      resolve: {
        tickets: ($state, TicketsService) => {

          return TicketsService.findMyTickets()
            .catch((error) => {
              console.log(error);
              $state.go('404');
            });

        }
      }
    });//.state('order-details', {
    //   url: '/my/orders/:orderNumber',
    //   templateUrl: 'app/orders/details/order-details.html',
    //   controller: 'OrderDetailsController',
    //   controllerAs: 'vm'
    // });
  });
