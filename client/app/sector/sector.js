'use strict';

angular.module('metalistTicketsApp')
  .config(function ($stateProvider) {
    $stateProvider.state('sector', {
      url: '/match/:id/:sector',
      templateUrl: 'app/sector/sector.html',
      controller: 'SectorSeatsController',
      controllerAs: 'sector',

      resolve: {
          sector: (SectorSeatsService, $stateParams) => {
              return SectorSeatsService.fetchSector($stateParams.id)
                },
          match: (MatchSeatsService, $stateParams, $state) => {
              return MatchSeatsService
                .fetchMatch($stateParams.id)
                .catch((error) => {
                console.log(error);
                    $state.go('404');
                  });
                },
          seats: (MatchSeatsService, $stateParams, $state) => {
              return MatchSeatsService.fetchMatchSeats($stateParams.id)
                  .catch((error) => {
                  console.log(error);
              $state.go('404');
                });
              },
          cart: (CartService) => {
              return CartService.cart;
              }
            }
      });
});


