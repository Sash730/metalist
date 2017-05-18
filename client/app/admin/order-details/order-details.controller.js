'use strict';

(function () {

  class OrderDetailsController {

    constructor(CartService) {
      this.CartService = CartService;
    }

    $onInit() {
      this.order = {};
      this.privateId = '';
      this.message = '';
    }

    getOrder() {
      this.order = {};
      this.message = '';

      this.CartService.getOrderByPrivateId(this.privateId)
        .then( response => this.order = response.data )
        .catch(err => {
          if(err.status === 404) {
            this.message = 'Ордер не найден.';
          }
        });
    }
  }

  angular.module('metalistTicketsApp.admin')
    .controller('OrderDetailsController', OrderDetailsController);
})();
