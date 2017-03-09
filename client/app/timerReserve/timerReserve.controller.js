'use strict';

(function () {

  class TimerReserveController {

    constructor(TimerReserveService) {
      this.timerService = TimerReserveService;

      this.countdown = 1800;
    }

    $onInit() {
      this.initComponent();
    }

    timerFinished() {
      this.timerService.stopTimer(true);
      this.initComponent();
    }

    initComponent() {
      this.timerMessage = this.timerService.message;
    }
  }

  angular.module('metalistTicketsApp')
    .controller('TimerReserveController', TimerReserveController);
})();
