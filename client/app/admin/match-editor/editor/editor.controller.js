'use strict';

(function () {

  class EditorController {

    constructor() {

      this.match = {};
      this.priceSchema = {};
      this.rival = '';
      this.date = new Date();
      this.date.setDate(this.date.getDate() + 1);
    }

    $onInit() {
      this.initComponent();
    }

    $onChanges(changes) {
      if (changes.matchToEdit) {
        if (!this.matchToEdit.id) {
          this.initComponent();
        }
        if (this.matchToEdit.id) {
          this.match = Object.assign({}, this.matchToEdit);
          this.match.date = new Date(this.matchToEdit.date);
        }
      }
      if ( changes.priceSchemas) {
        this.match.priceSchema = this.priceSchemas[0];
      }
    }

    initComponent() {
      this.match = {};
      this.match.date = this.date;
      this.match.rival = this.rival;
      this.match.priceSchema = this.priceSchemas[0];
    }

    update() {
      this.onChange({
        $event: {
          match: this.match
        }
      });
    }

  }

  angular.module('metalistTicketsApp.admin')
    .controller('EditorController', EditorController);
})();
