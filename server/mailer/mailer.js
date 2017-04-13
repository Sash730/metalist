'use strict';
import * as nodemailer from "nodemailer";
import moment from 'moment';
import * as config from "../config/environment"
import * as log4js from 'log4js';

let logger = log4js.getLogger('sendMail'),
  transport = nodemailer.createTransport('smtps://' + config.mailer.auth.user + ':' + config.mailer.auth.pass + '@smtp.gmail.com');

export function sendMailByOrder(order) {
  logger.info("Sending message to : " + order.user.email);
  let success = true;
  let mailOptions = {
    from: order.user.email,
    to: order.user.email,
    text: '',
    attachments: []
  };
  order.tickets.forEach(ticket => {
    let attach = {
      filename: 'MetalistTickets.pdf',
      path: config.domain + '/api/tickets/ticket/' + ticket.ticketNumber
    };

    if (!mailOptions.subject) {
      mailOptions.subject = ticket.match.headline + '. Дата: ' + moment(ticket.match.date).tz('Europe/Kiev').locale('ru').format('DD MMMM YYYY HH:mm');
    }
    mailOptions.attachments.push(attach);
  });

  transport.sendMail(mailOptions, (error, response) => {
    if (error) {
      logger.error('sendMail ' + error);
      success = false;
    } else {
      logger.info("[INFO] Message Sent: " + response.message);
    }
  });
}

export function sendMailTemporaryPassword(to, password) {
  let success = true,
    mailOptions = {
      from: to,
      to: to,
      subject: 'Temporary guest password',
      text: 'Ваш временный пароль  ' + password
    };

  transport.sendMail(mailOptions, (error) => {
    if (error) {
      logger.error('sendMail ' + error);
      success = false;
    } else {
      logger.info("[INFO] Password sent");
    }
  });
}
