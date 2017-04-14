'use strict';

(function () {

  class TicketsController {

    constructor($interval, $scope, TicketsService) {
      this.tickets = [];
      this.$scope = $scope;
      this.ticketsService = TicketsService;
      this.isLoading = false;
      this.$interval = $interval;
      this.stopTime = this.$interval(this.getPendingStatus.bind(this), 1000);
      this.getTickets();

      this.$scope.$on('$destroy', this.stopHandling.bind(this));
    }

    getPendingStatus() {
      this.ticketsService.getPendingStatus()
        .then(status => {
          this.isLoading = status;
          if (!status) {
            this.stopHandling();
            this.getTickets()
          }
        })
    }

    stopHandling() {
      this.$interval.cancel(this.stopTime);
    }

    getTickets() {
      this.ticketsService.getMyTickets()
        .then(tickets => {
          this.tickets = tickets;
        })
    }

  }

  angular.module('metalistTicketsApp')
    .controller('TicketsController', TicketsController);
})();
