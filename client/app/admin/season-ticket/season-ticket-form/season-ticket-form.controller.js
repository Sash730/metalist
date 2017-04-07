'use strict';

(function () {

  class SeasonTicketFormController {

    constructor() {

      this.newTicket = {};
      this.date = new Date();
      this.date.setMonth(this.date.getMonth() + 4);
      this.errorMessageBlockRow = '';
    }

    $onInit() {
      this.onInit();
    }

    $onChanges(changes) {
      if ( changes.errorMessage ) {
        this.errorMessageBlockRow = this.errorMessage;
      }
    }

    onInit() {
      this.newTicket = {};
      this.newTicket.reservedUntil = this.date;
      this.errorMessageBlockRow = '';
    }

    update() {
      this.onChange({
        $event: {
          ticket: this.newTicket
        }
      });
      this.onInit();
    }

  }

  angular.module('metalistTicketsApp.admin')
    .controller('SeasonTicketFormController', SeasonTicketFormController);
})();
