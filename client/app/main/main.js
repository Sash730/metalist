'use strict';

angular.module('metalistTicketsApp')
    .config(function ($stateProvider) {
        $stateProvider.state('main', {
            abstract: true,
            url: '/',
            template: '<ui-view />',
            resolve: {
                temp: () => {
                    return {a: 1};
                }
            }
        });
    });
