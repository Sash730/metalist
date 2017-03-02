'use strict';

(function () {

  class TicketsStatisticController {
    constructor(TicketsService, MatchEditorService, OrdersService) {
      this.ticketsService = TicketsService;
      this.matchEditorService = MatchEditorService;
      this.ordersService = OrdersService;

      this.statistic = {};
      this.matches = [];
      this.allOrders = [];
    }

    $onInit() {
      this.loadMatches();
      this.getAllOrders();
    }

    loadMatches() {
      return this.matchEditorService.loadMatches().then(mathces => this.matches = mathces);
    }

    getStatisticForTickets(date) {
      this.ticketsService.getCountPaidTickets(date)
        .then(statistic => { this.statistic = statistic; });
    }


    getAllOrders() {
      return this.ordersService.getAllOrders()
        .then( orders => this.allOrders = orders );
    }
  }

  angular.module('metalistTicketsApp.admin')
    .controller('TicketsStatisticController', TicketsStatisticController);
})();
