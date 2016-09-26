'use strict';

angular.module('metallistTicketsApp')

// A RESTful factory for retrieving contacts from 'contacts.json'
    .factory('contacts', function ($http, utils) {
        var path = 'app/contacts/contacts.json';
        var contacts = $http.get(path).then(function (resp) {
            return resp.data.contacts;
        });

        var factory = {};
        factory.all = function () {
            return contacts;
        };
        factory.get = function (id) {
            return contacts.then(function () {
                return utils.findById(contacts, id);
            })
        };
        return factory;
    });
