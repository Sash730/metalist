(function () {
  'use strict';

  angular.module('metalistTicketsApp')
    .config(function ($stateProvider) {
      $stateProvider.state('sector', {
        url: '/sector/:id',
        templateUrl: 'app/sectors-seats/sectors-seats.html',
        controller: 'SectorSeatsController',
        controllerAs: 'vm',

        resolve: {
          sector: (SectorSeatsService, $stateParams) => {
            return SectorSeatsService.fetchSector($stateParams.id)
          }
        }
      })
    });
})();
