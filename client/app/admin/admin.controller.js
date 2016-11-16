'use strict';

function convertDataStingToObject (data) {
  for(let i=0; i < data.length; i++ ){
    data[i].date = new Date(data[i].date);
  }
  return data;
}
(function () {

  class AdminController {
        constructor(User, $http) {
          this.newMatch = {};
          this.newMatch.date = new Date()
          this.paidOrders = [];
          this.matches = [];
           this.matchDate = '';

          this.users = User.query();

          this.$http = $http;
          this.matches = [];

          this.$http.get('/api/matches')
            .then((response) => {
              this.matches = convertDataStingToObject(response.data);
          });


        }

      save(a) {
        this.$http({
          method: 'PUT',
          url: '/api/matches',
          data: a,
          headers: {'Accept': 'application/json'}
        });

        this.$http.get('/api/matches')
          .then((response) => {
          this.matches = convertDataStingToObject(response.data);
      });

      }

      editMatch(a) {
        console.log('editMatch', a);
        this.$http({
          method: 'PUT',
          url: '/api/matches/' + a._id,
          data: a,
          headers: {'Accept': 'application/json'}
        });

        this.$http.get('/api/matches')
          .then((response) => {
           this.matches = convertDataStingToObject(response.data);
      });
      }

      deleteMatch(a) {
        this.$http({
          method: 'delete',
          url: '/api/matches/' + a._id,
          headers: {'Accept': 'application/json'}
        });

        this.$http.get('/api/matches')
          .then((response) => {
          this.matches = convertDataStingToObject(response.data);
      });
      }

      getCountPaidOrders(a){
        this.$http( {
          method: 'get',
          url:'/api/orders/' + a,
          headers: {'Accept': 'application/json'}
        })
          .then((response) => {
            this.paidOrders = convertDataStingToObject(response.data);
          });
      }

      delete(user) {
        user.$remove();
        this.users.splice(this.users.indexOf(user), 1);
      }
    }

    angular.module('metalistTicketsApp.admin')
        .controller('AdminController', AdminController);
})();
