'use strict';

angular.module('metalistTicketsApp')
    .filter('money', () => {
        return (amount) => {
          if(!amount) return '';
            return (amount / 100).toFixed(2) + 'UAH';
        };
    });
