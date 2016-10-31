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
        Order.create({
            orderNumber: 'order_number_1',
            amount: 7000,
            status: 'failed',
            type: 'order',
            context: 'website',
            paymentDetails: {key: 'value'},
            items: [ {
                seat: {
                    id: 1,
                    sector: 1,
                    row: 1,
                    number: 1
                },
                match: {
                    id: 1,
                    headline: 'Metalist vs Dnipro',
                    round: 6,
                    date: new Date('2016-11-15 15:00:00')
                },
                amount: 7000
            } ],
            user: {name: 'user_1', email: 'user_1@example.com'}
        },{
          orderNumber: 'order_number_5',
          amount: 7000,
          status: 'paid',
          type: 'order',
          context: 'website',
          paymentDetails: {key: 'value'},
          items: [ {
            seat: {
              id: 1,
              sector: 1,
              row: 1,
              number: 1
            },
            match: {
              id: 1,
              headline: 'Metalist vs Dnipro',
              round: 6,
              date: new Date('2016-11-15 15:00:00')
            },
            amount: 7000
          } ],
          user: {name: 'user_1', email: 'user_1@example.com'}
        }, {
            orderNumber: 'order_number_2',
            amount: 15000,
            status: 'paid',
            type: 'order',
            context: 'website',
            paymentDetails: {key: 'value'},
            items: [ {
                seat: {
                    id: 33,
                    sector: 2,
                    row: 3,
                    number: 4
                },
                match: {
                    id: 1,
                    headline: 'Metalist vs Dnipro',
                    round: 6,
                    date: new Date('2016-11-15 15:00:00')
                },
                amount: 7000
            }, {
                seat: {
                    id: 3,
                    sector: 1,
                    row: 5,
                    number: 6
                },
                match: {
                    id: 2,
                    headline: 'Metalist vs Dynamo',
                    round: 8,
                    date: new Date('2016-11-19 15:00:00')
                },
                amount: 8000
            } ],
            user: {name: 'user_2', email: 'user_2@example.com'}
        },{
          orderNumber: 'order_number_3',
          amount: 15000,
          status: 'paid',
          type: 'order',
          context: 'website',
          paymentDetails: {key: 'value'},
          items: [ {
            seat: {
              id: 33,
              sector: 1,
              row: 3,
              number: 4
            },
            match: {
              id: 1,
              headline: 'Metalist vs Dnipro',
              round: 6,
              date: new Date('2016-11-15 15:00:00')
            },
            amount: 7000
          }, {
            seat: {
              id: 3,
              sector: 2,
              row: 5,
              number: 6
            },
            match: {
              id: 2,
              headline: 'Metalist vs Dynamo',
              round: 8,
              date: new Date('2016-11-19 15:00:00')
            },
            amount: 8000
          } ],
          user: {name: 'user_2', email: 'user_2@example.com'}
        },{
          orderNumber: 'order_number_6',
          amount: 12000,
          status: 'paid',
          type: 'order',
          context: 'website',
          items: [ {
            seat: {
              id: 5524,
              sector: 1,
              row: 35,
              number: 67
            },
            match: {
              id: 2,
              headline: 'Metalist vs Dynamo',
              round: 8,
              date: new Date('2016-11-19 15:00:00')
            },
            amount: 9000
          }, {
            seat: {
              id: 2212,
              sector: 1,
              row: 15,
              number: 78
            },
            match: {
              id: 1,
              headline: 'Metalist vs Dnipro',
              round: 6,
              date: new Date('2016-11-15 15:00:00')
            },
            amount: 9000
          }],
          user: {name: 'user_3', email: 'user_3@example.com'}
        }, {
            orderNumber: 'order_number_4',
            amount: 12000,
            status: 'new',
            type: 'order',
            context: 'website',
            items: [ {
                seat: {
                    id: 5524,
                    sector: 1,
                    row: 35,
                    number: 67
                },
                match: {
                    id: 2,
                    headline: 'Metalist vs Dynamo',
                    round: 8,
                    date: new Date('2016-11-15 15:00:00')
                },
                amount: 9000
            }, {
                seat: {
                    id: 2212,
                    sector: 1,
                    row: 15,
                    number: 78
                },
                match: {
                    id: 1,
                    headline: 'Metalist vs Dnipro',
                    round: 6,
                    date: new Date('2016-11-15 15:00:00')
                },
                amount: 9000
            } ],
            user: {name: 'user_3', email: 'user_3@example.com'}
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
            seat: {
                sector: 1,
                row: 1,
                number: 1
            },
            match: {
                headline: 'Metalist vs Dnipro',
                round: 6,
                date: new Date('2016-11-15 15:00:00')
            },
            user: {name: 'user_1', email: 'user_1@example.com'},
            status: 'new',
            valid: {
                from: new Date('2016-11-15 13:00:00'),
                to: new Date('2016-11-15 17:00:00')
            },
            timesUsed: 0
        }, {
            orderNumber: 'order_number_2',
            accessCode: 'access_code_2_1',
            seat: {
                id: 3,
                    sector: 4,
                    row: 5,
                    number: 6
            },
            match: {
                id: 2,
                    headline: 'Metalist vs Dynamo',
                    round: 8,
                    date: new Date('2016-11-15 15:00:00')
            },
            user: {name: 'user_2', email: 'user_2@example.com'},
            status: 'new',
            valid: {
                from: new Date('2016-11-19 14:00:00'),
                to: new Date('2016-11-19 18:00:00')
            },
            timesUsed: 0
        }, {
            orderNumber: 'order_number_2',
            accessCode: 'access_code_2_2',
            seat: {
                id: 33,
                    sector: 2,
                    row: 3,
                    number: 4
            },
            match: {
                id: 1,
                    headline: 'Metalist vs Dnipro',
                    round: 6,
                    date: new Date('2016-11-15 15:00:00')
            },
            user: {name: 'user_2', email: 'user_2@example.com'},
            status: 'new',
            valid: {
                from: new Date('2016-11-19 14:00:00'),
                to: new Date('2016-11-19 18:00:00')
            },
            timesUsed: 0
        })
            .then(() => {
                console.log('finished populating tickets');
            });
    });
