'use strict';

angular.module('metallistTicketsApp')
    .filter('money', () => {
        return (amount) => {
            return (amount / 100).toFixed(2) + 'UAH';
        };
    });
