'use strict';

(function () {

    function UserResource($resource) {
        return $resource('/api/users/:id/:controller', {
            id: '@_id'
        }, {
            changePassword: {
                method: 'PUT',
                params: {
                    controller: 'password'
                }
            },
            generateGuestPassword: {
              method: 'PUT',
              params: {
                controller: 'temporary-password'
              }
            },
            recoveryPassword:{
              method: 'PUT',
              params: {
                controller: 'recovery-password'
              }
            },
            get: {
                method: 'GET',
                params: {
                    id: 'me'
                }
            }
        });
    }

    angular.module('metalistTicketsApp.auth')
        .factory('User', UserResource);
})();
