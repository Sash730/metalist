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
            date: new Date('2016-09-15 15:00:00'),
            round: 6,
            info: 'passed event'
        }, {
            rival: "Dynamo",
            homeMatch: true,
            date: new Date('2016-10-15 15:00:00'),
            round: 8,
            info: 'some very useful information about the match'
        }, {
            rival: "Karpaty",
            homeMatch: true,
            date: new Date('2016-10-19 16:00:00'),
            round: 9,
            info: 'some very useful information about the match 2'
        }, {
            rival: "Shakhtar",
            homeMatch: false,
            date: new Date('2016-10-25 16:00:00'),
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
            price: 7000,
        }, {
            sector: 1,
            row: 1,
            number: 2,
            price: 7000,
        }, {
            sector: 1,
            row: 1,
            number: 3,
            price: 7000,
        }, {
            sector: 1,
            row: 1,
            number: 4,
            price: 7000,
        }, {
            sector: 1,
            row: 1,
            number: 5,
            price: 7000,
        }, {
            sector: 2,
            row: 1,
            number: 1,
            price: 7800,
        }, {
            sector: 3,
            row: 2,
            number: 1,
            price: 8000,
        }, {
            sector: 3,
            row: 2,
            number: 2,
            price: 8000,
        }, {
            sector: 3,
            row: 2,
            number: 3,
            price: 8000,
        })
            .then(() => {
                console.log('finished populating seats');
            });
    });

Order.find({}).remove()
    .then(() => {
        Order.create({
            orderNumber: 'order_number_1',
            amount: 7000,
            status: 'paid',
            type: 'order',
            context: 'website',
            paymentDetails: {key: 'value'},
            items: [ {
                seatId: 1,
                matchId: 1,
                amount: 7000
            } ],
            user: {name: 'user_1', email: 'user_1@example.com'},
        }, {
            orderNumber: 'order_number_2',
            amount: 15000,
            status: 'paid',
            type: 'order',
            context: 'website',
            paymentDetails: {key: 'value'},
            items: [ {
                seatId: 1,
                matchId: 1,
                amount: 7000
            }, {
                seatId: 2,
                matchId: 1,
                amount: 8000
            } ],
            user: {name: 'user_2', email: 'user_2@example.com'},
        })
            .then(() => {
                console.log('finished populating orders');
            });
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
        Ticket.create({
            orderNumber: 'order_number_1',
            accessCode: 'access_code_1',
            match: '1',
            seat: '1',
            user: '1',
            status: 'new',
            valid: {
                from: new Date('2016-10-15 13:00:00'),
                to: new Date('2016-10-15 17:00:00'),
            },
            timesUsed: 0
        }, {
            orderNumber: 'order_number_2',
            accessCode: 'access_code_2_1',
            match: '2',
            seat: '2',
            user: '2',
            status: 'new',
            valid: {
                from: new Date('2016-10-19 14:00:00'),
                to: new Date('2016-10-19 18:00:00'),
            },
            timesUsed: 0
        }, {
            orderNumber: 'order_number_2',
            accessCode: 'access_code_2_2',
            match: '2',
            seat: '3',
            user: '2',
            status: 'new',
            valid: {
                from: new Date('2016-10-19 14:00:00'),
                to: new Date('2016-10-19 18:00:00'),
            },
            timesUsed: 0
        })
            .then(() => {
                console.log('finished populating tickets');
            });
    });
