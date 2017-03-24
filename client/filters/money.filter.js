'use strict';

angular.module('metalistTicketsApp')
    .filter('money', () => {
        return (amount) => {
          if(amount) {
            return (amount / 100).toFixed(2) + 'UAH';
          } else {
            return amount;
          }
        };
    });
