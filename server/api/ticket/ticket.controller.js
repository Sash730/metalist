'use strict';

import Ticket from './ticket.model';
import User from '../user/user.model';
import moment from 'moment-timezone';
import * as barcode from 'bwip-js';
import * as ticketService from '../ticket/ticket.service';
import * as pdfGenerator from '../../pdfGenerator';
import * as log4js from 'log4js';

const logger = log4js.getLogger('Ticket');
const sectorsInVip = ['VIP_B', 'VIP_BR', 'VIP_BL', 'VIP_AR', 'VIP_AL', 'SB_1', 'SB_7'];

export function getTicketPdfById(req, res) {
  return ticketService.getByTicketNumber(req.params.ticketNumber)
    .then(handleEntityNotFound(res))
    .then(ticket => {
      if(ticket) {
        return generatePdfTicket(ticket, res);
      }
    })
    .catch(handleError(res));
}

export function getMyTickets(req, res) {
  return User.findById(req.user.id)
    .then(user => {
      return ticketService.getUserTickets(user.tickets);
    })
    .then(tickets => {
      return tickets.filter(ticket => ticket);
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function getEventsStatistics(req, res) {
  let period = moment().subtract(1, 'days');

  Ticket.find({'match.date': {$gte: period}})
    .where({
      $or: [
        {status: 'paid'},
        {status: 'used'}
      ]
    })
    .sort({'match.date': 1})
    .then(tickets => {
      return tickets.map(ticket => {
        return {
          headline: ticket.match.headline,
          sector: ticket.seat.sector,
          date: ticket.match.date,
          amount: ticket.amount
        }
      })
    })
    .then(respondWithResult(res))
    .catch(handleError(res))
  ;
}

export function getDaysStatistics(req, res) {
  let period = moment().subtract(30, 'days');
  console.log('-----------------',period);

  Ticket.find({reserveDate: {$gte: new Date(period)}})
    .where({
      $or: [
        {status: 'paid'},
        {status: 'used'}
      ]
    })
    .then(statistics => {
      console.log('--------ddd-', statistics);
      return statistics.map(stat => {
        return {
          date: moment(stat.reserveDate).tz('Europe/Kiev').format('DD-MM-YYYY'),
          amount: stat.amount
        }
      });
    })
    .then(respondWithResult(res))
    .catch(handleError(res))
  ;
}

export function use(req, res, next) {
  let code = req.params.code,
    tribune = req.params.tribune;

  return Promise.all([
    getTicketByCode(code),
    getCountTicketsByTribune(tribune)
  ])
    .then(([ticket, count]) => {
      if (!ticket) {
        return res.status(200).json({count: count, message: 'Билет не действительный.'});
      }
      let result = {
        ticket: getFormattedTicket(ticket),
        count: count
      };
      if (tribune === 'vip') {
        if (!sectorsInVip.includes(ticket.seat.sector)) {
          result.message = "Другая трибуна";
          return res.status(200).json(result);
        }
        ticket.status = 'used';
        return ticket.save()
          .then(() => res.status(200).json(result));
      } else {
        if (ticket.seat.tribune !== tribune || (ticket.seat.tribune === tribune && sectorsInVip.includes(ticket.seat.sector))) {
          result.message = "Другая трибуна";
          return res.status(200).json(result);
        }
        ticket.status = 'used';
        return ticket.save()
          .then(() => res.status(200).json(result));
      }
    })
    .catch(handleError(res));
}

export function getTicketsForCheckMobile(req, res) {
  let dateNow = new Date();

  return Ticket.find({status: 'paid'})
    .exec()
    .then(tickets => {
      let result = tickets.map(ticket => {
        return {
          'tribune': ticket.seat.tribune,
          'sector': ticket.seat.sector,
          'row': ticket.seat.row,
          'seat': ticket.seat.seat,
          'headline': ticket.match.headline
        };
      });

      return res.status(200).json(result);
    })
    .catch(handleError(res));
}

export function getCountValidTicketsByTribune(req, res, next) {
  let tribune = req.params.tribune;

  return getCountTicketsByTribune(tribune)
    .then(count => {
      return res.status(200).json(count);
    })
    .catch(handleError(res));
}




function generatePdfTicket(ticket, res) {
  return new Promise((resolve, reject) => {
    pdfGenerator.generateTicket(ticket, res, function (err, res) {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    });
  });
}

function getFormattedTicket(ticket) {
  return {
    'tribune': ticket.seat.tribune,
    'sector': ticket.seat.sector,
    'row': ticket.seat.row,
    'seat': ticket.seat.seat,
    'headLine': ticket.match.headline
  };
}

function getTicketByCode(code) {
  let dateNow = new Date();

  return Ticket.findOne({accessCode: code, status: 'paid'});
  // .where({
  //   $and: [
  //     {'valid.from': {$lte: dateNow}},
  //     {'valid.to': {$gt: dateNow}}
  //   ]
  // });
}

function getCountTicketsByTribune(tribune) {
  let dateNow = new Date();

  return Ticket.find({status: 'paid'})
  /*.where({$and: [
   {'valid.from': { $lte: dateNow }},
   {'valid.to': { $gt: dateNow }}
   ]})*/
    .then(tickets => {
      if (tribune === 'vip') {
        return tickets.filter(ticket => sectorsInVip.includes(ticket.seat.sector)).length;
      }
      return tickets.filter(ticket => ( ticket.seat.tribune === tribune && !sectorsInVip.includes(ticket.seat.sector) )).length;
    });
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


//private functions
function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
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
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}
