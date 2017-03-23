'use strict';

angular.module('metalistTicketsApp')
  .filter('simpleMoney', () => {
    return (amount) => {
      if(amount) {
        return (amount / 100);
      }
    };
  });

