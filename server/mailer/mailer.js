'use strict';
import * as nodemailer from "nodemailer";
import moment from 'moment';
import * as config from "../config/environment"
import * as pdfGenerator from "../pdfGenerator"
import * as fs from 'fs';

var transport = nodemailer.createTransport('smtps://'+config.mailer.auth.user+':'+config.mailer.auth.pass+'@smtp.gmail.com');

export function sendMail(to, order, ticket) {
  pdfGenerator.ticketBySendMail(ticket, function (err) {
    if (err) {
      console.log('Post cb', err);
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
          console.log('[ERROR] Message NOT sent: ', error);
          success = false;
        } else {
          fs.unlink('./server/pdfGenerator/temp/'+ticket.accessCode+'.pdf');
          console.log('[INFO] Message Sent: ' + response.message);
    }
    });
    }
  });

}
