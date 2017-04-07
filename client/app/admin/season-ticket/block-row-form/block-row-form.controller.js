'use strict';

(function () {

  class BlockRowFormController {

    constructor() {
      this.blockRow = {};
      this.date = new Date();
      this.date.setMonth(this.date.getMonth() + 6);
      this.errorMessageSeat = '';
    }

    $onInit() {
      this.initComponent();
    }

    initComponent() {
      this.blockRow = {};
      this.blockRow.reservedUntil = this.date;
      this.errorMessageSeat = '';
    }

    $onChanges(changes) {
      if ( changes.errorMessage ) {
        this.errorMessageSeat = this.errorMessage;
      }
    }

    add() {
      this.onAdd({
        $event: {
          blockRow: this.blockRow
        }
      });
      this.initComponent();
    }

  }

  angular.module('metalistTicketsApp.admin')
    .controller('BlockRowFormController', BlockRowFormController);
})();
