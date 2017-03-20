'use strict';
import * as nodemailer from "nodemailer";
import moment from 'moment';
import * as config from "../config/environment"
import * as log4js from 'log4js';

let logger = log4js.getLogger('sendMail'),
    transport = nodemailer.createTransport('smtps://'+config.mailer.auth.user+':'+config.mailer.auth.pass+'@smtp.gmail.com');

export function sendMail(to, order) {
      let success = true;
      let mailOptions = {
                          from: to,
                          to: to,
                          text: '',
                          attachments: []
                        };
      order.tickets.forEach(ticket => {
        let attach = {
          filename: 'MetalistTickets.pdf',
          path: config.domain + '/api/tickets/ticket/' + ticket.ticketNumber
        };

        if (!mailOptions.subject) {
          mailOptions.subject = 'Match ' +ticket.match.headline;
        }
        mailOptions.text += 'Match ' +ticket.match.headline+ ' Date ' + moment(ticket.match.date).format('MMM d, HH:mm')
                             +' Sector '+ticket.seat.sector+' Row ' +ticket.seat.row + ' Seat ' + ticket.seat.number + '\n';
        mailOptions.attachments.push(attach);
      });

      transport.sendMail(mailOptions, (error, response) => {
        if(error){
          logger.error('sendMail '+error);
          success = false;
        } else {
          logger.info("[INFO] Message Sent: "+  response.message);
    }
    });
}

export function sendMailTemporaryPassword(to, password) {
      let success = true,
          mailOptions = {
                          from: to,
                          to: to,
                          subject: 'Temporary guest password' ,
                          text: 'Ваш временный пароль  ' + password
                         };

      transport.sendMail(mailOptions, (error) => {
        if(error){
          logger.error('sendMail '+error);
          success = false;
        } else {
          logger.info("[INFO] Password sent");
        }
      });
}
