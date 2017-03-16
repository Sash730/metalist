'use strict';

(function () {

  class BlockRowFormController {

    constructor() {
      this.blockRow = {};
      this.date = new Date();
      this.date.setMonth(this.date.getMonth() + 6);
    }

    $onInit() {
      this.initComponent();
    }

    initComponent() {
      this.blockRow = {};
      this.blockRow.valid = this.date;
    }

    delete() {
      this.onDelete({
        $event: {
          blockRow: this.blockRow
        }
      });
      this.initComponent();
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
