'use strict';
import * as nodemailer from "nodemailer";
import moment from 'moment';
import * as config from "../config/environment"
import * as pdfGenerator from "../pdfGenerator"
import * as fs from 'fs';
import * as log4js from 'log4js';

var logger = log4js.getLogger('sendMail');
var transport = nodemailer.createTransport('smtps://'+config.mailer.auth.user+':'+config.mailer.auth.pass+'@smtp.gmail.com');

export function sendMail(to, order, ticket) {
  pdfGenerator.ticketBySendMail(ticket, function (err) {
    if (err) {
      logger.error('sendMail '+err);
    } else {
      var success = true;
      var mailOptions = {
        from: to,
        to: to,
        // cc: 'polyakov_as@ukr.net',
        subject: 'Match ' +ticket.match.headline ,
        text: 'Match ' +ticket.match.headline+ ' Date ' + moment(ticket.match.date).format('MMM d, HH:mm') +' Sector '+ticket.seat.sector+' Row ' +ticket.seat.row,
        attachments: [{
          filename: 'paymentDetails.pdf',
          path: './server/pdfGenerator/temp/'+ticket.accessCode+'.pdf'
        }]
      };
      transport.sendMail(mailOptions, (error, response) => {
        if(error){
          fs.unlink('./server/pdfGenerator/temp/'+ticket.accessCode+'.pdf');
          logger.error('sendMail '+error);
          success = false;
        } else {
          fs.unlink('./server/pdfGenerator/temp/'+ticket.accessCode+'.pdf');
          logger.info("[INFO] Message Sent: "+ ticket.accessCode + response.message);
    }
    });
    }
  });

}
