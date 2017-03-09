'use strict';

(function () {

  class TimerReserveService {

    constructor($rootScope) {
      this.$rootScope = $rootScope;

      this.message = '';
      this.timerRun = false;
    }

    startTimer() {
      this.message = '';
      if (!this.timerRun) {
        this.$rootScope.$broadcast('timer-start');
        this.timerRun = true;
      }
    };

    stopTimer(flag) {
      if (flag) {
        this.message = "Время брони билетов вышло.";
      }
      this.$rootScope.$broadcast('timer-reset');
      this.timerRun = false;
    };
  }

  angular.module('metalistTicketsApp')
    .service('TimerReserveService', TimerReserveService);
})();
