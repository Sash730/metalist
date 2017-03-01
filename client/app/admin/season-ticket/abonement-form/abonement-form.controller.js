'use strict';

(function () {

  class AbonementFormController {

    constructor() {

      this.ticketToEdit = {};
      this.date = new Date();
      this.date.setMonth(this.date.getMonth() + 4);
      this.output = '';
    }

    $onInit() {
      this.initComponent();
    }

    $onChanges(changes) {
      if (changes.seasonTicketToEdit) {
        if (!this.seasonTicketToEdit.id) {
          this.initComponent();
        }
        if (this.seasonTicketToEdit.id) {
          this.ticketToEdit = Object.assign({}, this.seasonTicketToEdit);
          this.ticketToEdit.valid = new Date(this.seasonTicketToEdit.valid);
          this.output = '';
        }
      }
      if (changes.message) {
        this.output = this.message;
      }
    }

    initComponent() {
      this.ticketToEdit = {};
      this.ticketToEdit.valid = this.date;
    }

    edit(ticket) {
      this.onEdit({
        $event: {
          ticket: ticket
        }
      });
    }

    update() {
      this.onChange({
        $event: {
          ticket: this.ticketToEdit
        }
      });
    }

  }

  angular.module('metalistTicketsApp.admin')
    .controller('AbonementFormController', AbonementFormController);
})();
