'use strict';

(function () {

  class MatchController {

    constructor(match, cart, $state) {
      this.$state = $state;

      this.match = match;
      this.cart = cart;
      this.priceSchema = this.match.priceSchema.priceSchema;
    }

    goToSector($event) {
      if ($event.price) {
        this.$state.go('sector', {id: this.match.id, tribune: $event.tribune, sector: $event.sector});
      }
    }

  }

  angular.module('metalistTicketsApp')
    .controller('MatchController', MatchController);
})();
