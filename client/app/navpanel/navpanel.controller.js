
'use strict';

(function () {

  class NavpanelController {

    constructor($stateParams, $state) {
      this.$state = $state;
      this.currentState = $state.current.name;
      this.stateParams = $stateParams;
    }

    goTo(route) {
      if (this.stateParams.id && route == 'match') {
        this.$state.go('match', {id: this.stateParams.id});
      }
    }

    getClass(navName) {
      if (this.isCheckoutPage()) {
        return 'crm';
      }
      if (navName == 'match' && this.stateParams.id) {
        return 'crm';
      }
      if (navName == 'sector' && this.stateParams.sector) {
        return 'crm';
      }
       return 'crmdis';
    }

    isCheckoutPage() {
      return this.currentState == 'checkout';
    }


  }

  angular.module('metalistTicketsApp')
    .controller('NavpanelController', NavpanelController);
})();
