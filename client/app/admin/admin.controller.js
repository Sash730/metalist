'use strict';

(function () {

    class AdminController {
        constructor(User, $http,) {
          this.newMatch = {};

          this.matches = [];

            this.users = User.query();

            this.$http = $http;
            this.matches = [];

            this.$http.get('/api/matches')
              .then((response) => {
              this.matches = response.data;
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
          this.matches = response.data;
      });

      }

      editMatch(a) {
        this.$http({
          method: 'PUT',
          url: '/api/matches/' + a._id,
          data: a,
          headers: {'Accept': 'application/json'}
        });

        this.$http.get('/api/matches')
          .then((response) => {
          this.matches = response.data;
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
          this.matches = response.data;
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
