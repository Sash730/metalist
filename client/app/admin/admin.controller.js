'use strict';

(function () {

  class AdminController {
    constructor(TicketsService) {
      this.ticketsService = TicketsService;
      this.message = '';
      this.matchId = '';
    }

    addStadiumSeats() {
    this.ticketsService.addStadiumSeats(this.matchId)
      .then(() => {
        this.message = 'Места успешно созданы.';
      })
      .catch(err => {
        console.log(err);
        this.message = 'Что-то пошло не так...';
      })
    };
  }

  angular.module('metalistTicketsApp.admin')
    .controller('AdminController', AdminController);
})();
