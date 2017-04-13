'use strict';

angular.module('metalistTicketsApp')
    .filter('money', () => {
        return (amount) => {
          if(amount) {
            return amount + ' UAH';
          }
          return amount;
        };
    });
