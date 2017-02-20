'use strict';

angular.module('metalistTicketsApp')
  .config(function ($stateProvider) {
    $stateProvider.state('sector', {
      url: '/match/:id/tribune/:tribune/sectors/:sector',
      templateUrl: 'app/sector/sector.html',
      controller: 'SectorController',
      controllerAs: 'vm',
      resolve: {
        sector: (Stadium, $stateParams) => {
          return Stadium['tribune_'+$stateParams.tribune]['sector_'+$stateParams.sector];
        },
        match: (MatchService, $stateParams, $state) => {
              return MatchService
                .fetchMatch($stateParams.id)
                .catch((error) => {
                console.log(error);
                    $state.go('404');
                  });
                },
        tickets: (TicketsService, $stateParams,  $state) => {
              return TicketsService.fetchReservedTickets($stateParams.id, $stateParams.sector)
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


