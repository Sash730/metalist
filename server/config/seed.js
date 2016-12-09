/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import User from '../api/models/user.model';
import Ticket from '../api/models/ticket.model';
import Match from '../api/models/match.model';
import Seat from '../api/models/seat.model';
import {Order} from '../api/models/order.model';

Match.find({}).remove()
    .then(() => {
        Match.create({
            rival: "Dnipro",
            homeMatch: true,
            date: new Date('2016-11-15 15:00:00'),
            round: 6,
            info: 'passed event'
        }, {
            rival: "Dynamo",
            homeMatch: true,
            date: new Date('2016-11-19 15:00:00'),
            round: 8,
            info: 'some very useful information about the match'
        }, {
            rival: "Karpaty",
            homeMatch: true,
            date: new Date('2016-11-19 16:00:00'),
            round: 9,
            info: 'some very useful information about the match 2'
        }, {
            rival: "Shakhtar",
            homeMatch: true,
            date: new Date('2016-11-25 16:00:00'),
            round: 10,
            info: 'some very useful information about the match 3'
        }, {
            rival: "Olympic",
            homeMatch: true,
            dateApproximate: '30 October - 1 November',
            round: 11,
            info: 'Date to be specified later. Other useful information about the match 4'
        })
            .then(() => {
                console.log('finished populating matches');
            });
    });


Seat.find({}).remove()
    .then(() => {
        Seat.create({
            sector: 1,
            row: 1,
            number: 1,
            price: 7000
        }, {
            sector: 1,
            row: 1,
            number: 2,
            price: 7000
        }, {
            sector: 1,
            row: 1,
            number: 3,
            price: 7000
        }, {
            sector: 1,
            row: 1,
            number: 4,
            price: 7000
        }, {
            sector: 1,
            row: 1,
            number: 5,
            price: 7000
        }, {
            sector: 2,
            row: 1,
            number: 1,
            price: 7800
        }, {
            sector: 3,
            row: 2,
            number: 1,
            price: 8000
        }, {
            sector: 3,
            row: 2,
            number: 2,
            price: 8000
        }, {
            sector: 3,
            row: 2,
            number: 3,
            price: 8000
        })
            .then(() => {
                console.log('finished populating seats');
            });
    });

Order.find({}).remove()
    .then(() => {
    });

User.find({}).remove()
    .then(() => {
        User.create({
            provider: 'local',
            name: 'Test User',
            email: 'test@example.com',
            password: 'test'
        }, {
            provider: 'local',
            name: 'Test Steward',
            email: 'steward@example.com',
            password: 'test'
        }, {
            provider: 'local',
            name: 'Test Cashier',
            email: 'cashier@example.com',
            password: 'test'
        }, {
            provider: 'local',
            name: 'Test User',
            email: 'test@example.com',
            password: 'test'
        }, {
            provider: 'local',
            role: 'admin',
            name: 'Admin',
            email: 'admin@example.com',
            password: 'admin'
        })
            .then(() => {
                console.log('finished populating users');
            });
    });

Ticket.find({}).remove()
            .then(() => {
                console.log('finished populating tickets');
            });
