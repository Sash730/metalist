'use strict';

import Ticket from './ticket.model';
import SeasonTicket from '../seasonTicket/seasonTicket.model';
import moment from 'moment';
import * as config from "../../config/environment"
import * as barcode from 'bwip-js';
import * as _ from 'lodash';
import liqpay from '../../liqpay';
import * as pdfGenerator from '../../pdfGenerator';
import * as log4js from 'log4js';

const logger = log4js.getLogger('Ticket');

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      logger.info('respondWithResult ' + entity._id);
      return res.status(statusCode).json(entity);
    }
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    logger.error('handleError ' + err);
    res.status(statusCode).send(err);
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    logger.info("handleEntityNotFound " + entity);
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

let generatePdfTicket = (ticket, res) => {
  return new Promise((resolve, reject) => {
    pdfGenerator.generateTicket(ticket, res, function (err, res) {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    });
  });
};

let getSecureReservedTickets = (matchId, sectorNumber) => {
  return Ticket.find({'match.id': matchId, 'seat.sector': sectorNumber})
    .where({
      $or: [
        {status: 'paid'},
        {
          $and: [
            {reserveDate: {$gt: moment()}},
            {cartId: {$ne: null}}
          ]
        }
      ]
    }).exec()
    .then(tickets => {
      return tickets.map(ticket => {
        return {
          'seatId': ticket.seat.id
        };
      });
    })
};

export function index(req, res) {
  return Ticket.find().exec()
    .then(tickets => {
      var result = _.map(tickets, (ticket) => {

        var paymentParams = {
          'action': 'pay',
          'amount': '0.01',

          'currency': 'UAH',
          'description': ticket.text,
          'order_id': ticket.id,
          'sandbox': config.liqpay.sandboxMode,
          'server_url': config.liqpay.callbackUrl,
          'result_url': config.liqpay.redirectUrl,
        };


        return {
          '_id': ticket.id,
          'text': ticket.text,
          'available': ticket.available,
          'used': ticket.used,
          'code': ticket.code,
          'buyNowLink': ticket.available ? liqpay.generatePaymentLink(paymentParams) : null
        };
      });

      return res.status(200).json(result);
    })
    .catch(handleError(res));
}

export function getReservedTickets(req, res) {
  let matchId = req.params.id,
    sectorNumber = req.params.sector;

  return Promise.all([
    getSecureReservedTickets(matchId, sectorNumber),
    SeasonTicket.find({valid: {$gte: new Date()}, sector: sectorNumber})
      .then(tickets => {
        return tickets.map(ticket => {
          return {
            'seatId': ticket.seatId
          };
        });
      })
  ])
    .then(([reservedTickets, seasonTickets]) => {
      return reservedTickets.concat(seasonTickets);
    })
    .then(respondWithResult(res))
    .catch(handleError(res))
}

export function print(req, res, next) {
  return Ticket.findOne({code: req.params.code, available: false}).exec()
    .then(handleEntityNotFound(res))
    .then((ticket) => {
      if (ticket) {

        barcode.toBuffer({
          bcid: 'code128',       // Barcode type
          text: ticket.code,     // Text to encode
          scale: 3,               // 3x scaling factor
          height: 10,              // Bar height, in millimeters
          includetext: true,            // Show human-readable text
          textxalign: 'center',        // Always good to set this
          textsize: 13               // Font size, in points
        }, function (err, png) {
          // png is a Buffer. can be saved into file if needed  fs.writeFile(ticket._id + '.png', png)

          if (err) {
            return res.status(500).send('Could not generate ticket');
          } else {

            return res.render('ticket/print', {
              ticket: ticket,
              barcodeUri: png.toString('base64'),
            })

          }
        });
      }
    })
    .catch(handleError(res));
}

export function use(req, res, next) {
  let dateNow = new Date();

  return Ticket.findOne({accessCode: req.params.code, status: 'paid'})
    .where({
      $and: [
        {'valid.from': {$lte: dateNow}},
        {'valid.to': {$gt: dateNow}}
      ]
    })
    .exec()
    .then((ticket) => {
      if (!ticket) {
        return res.status(200).json({message: 'Ticket not found'});
      }
      ticket.status = 'used';
      return ticket.save()
        .then((ticket) => {
          let result = {
            'seat': ticket.seat,
            'headLine': ticket.match.headline,
            'used': ticket.used,
            'code': ticket.accessCode,
            'amount': ticket.amount
          };
          return res.status(200).json(result);
        });
    })
    .catch(handleError(res));
}

export function getTicketsForCheckMobile(req, res) {
  let dateNow = new Date();

  return Ticket.find({status: 'paid'})
  /*.where({$and: [
   {'valid.from': { $lte: dateNow }},
   {'valid.to': { $gt: dateNow }}
   ]})*/
    .exec()
    .then(tickets => {
      let result = _.map(tickets, (ticket) => {

        return {
          'cartId': ticket.cartId,
          'status': ticket.status,
          'seat': ticket.seat,
          'headLine': ticket.match.headline,
          'used': ticket.used,
          'code': ticket.accessCode,
          'amount': ticket.amount
        };
      });

      return res.status(200).json(result);
    })
    .catch(handleError(res));
}

export function getEventsStatistics(req, res) {

  Ticket.aggregate([
    {$match: {status: 'paid', 'match.date': {$gte: new Date()}}},
    {$project: {'_id': 0, 'match.headline': 1, 'match.date': 1, amount: 1}},
    {$group: {_id: {headline: '$match.headline', date: '$match.date'}, count: {$sum: 1}, total: {$sum: '$amount'}}},
    {$sort: {'_id.date': 1}}
  ])
    .then(statistics => {
      return statistics.map(stat => {
        return {
          headline: stat._id.headline,
          date: stat._id.date,
          count: stat.count,
          total: stat.total
        }
      });

    })
    .then(respondWithResult(res))
    .catch(handleError(res))
  ;
}

export function getDaysStatistics(req, res) {
  let day = new Date();
      day.setHours(2);
      day.setMinutes(0);
      day.setSeconds(0);
  let tzOffset = 2,
    period = moment(day).subtract(30, 'day');

console.log(new Date(period));
  Ticket.aggregate([
    {$match: {status: 'paid', reserveDate: {$gte: new Date(period)}}},
    {$project: {'_id': 0, reserveDate: 1, amount: 1}},
    {$sort: {reserveDate: -1}},
    {$group: {
        _id: {
          $subtract: [
            { $add: [
              { $subtract: [ '$reserveDate', new Date("1970-01-01") ] },
              tzOffset * 1000 * 60 * 60
            ]},
            { $mod: [
              { $add: [
                { $subtract: [ '$reserveDate', new Date("1970-01-01") ] },
                tzOffset * 1000 * 60 * 60
              ]},
              1000 * 60 * 60 * 24
            ]}
          ]

        } ,
        count: {$sum: 1}, total: {$sum: '$amount'}
      }
    }
  ])
    .then(statistics => {
      return statistics.map(stat => {
        return {
          date: stat._id,
          count: stat.count,
          total: stat.total
        }
      });
    })
    .then(respondWithResult(res))
    .catch(handleError(res))
  ;
}

export function getTicketPdfById(req, res, next) {
  return Ticket.findOne({ticketNumber: req.params.ticketNumber}).exec()
    .then((ticket) => {
      if (ticket) {
        return generatePdfTicket(ticket, res);
      }
    })
    .catch(handleError(res));

}
