'use strict';
import * as barcode from 'bwip-js';
import * as fs from 'fs';
import moment from 'moment';
import * as log4js from 'log4js';

let logger = log4js.getLogger('createPdfFile'),
    PDFDocument = require('pdfkit');

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    logger.error('getTicketPdfById '+err);
    res.status(statusCode).send(err);
  };
}

let generateBarcodePng = (ticket) =>{
  return new Promise((resolve, reject) => {
    barcode.toBuffer({
      bcid:        'code128',
      text:        String(ticket.accessCode),
      scale:       3,               // 3x scaling factor
      height:      10,              // Bar height, in millimeters
      includetext: true,            // Show human-readable text
      textxalign:  'center',        // Always good to set this
      textsize:    13               // Font size, in points
    }, function (err, png) {
      if (err) {
        return reject(err);
      } else {
        return resolve(png);
      }
    });
  });
};

let generatePdfPage = (writeStream, ticket, png) => {
  let doc = new PDFDocument();
  doc.pipe(writeStream);
  doc.image(__dirname + '/ticket.png', 0, 0, {width: 600});
  doc.font(__dirname + '/fonts/OpenSans-Bold.ttf');
  doc.fontSize(20)
    .text('Матч - ' + ticket.match.headline, 180, 240)
    .text('Дата - ' + moment(ticket.match.date).format('MMM d, HH:mm'), 180, 260)
    .text('Трибуна - ' + ticket.seat.tribune, 200, 540)
    .text('Сектор - ' + ticket.seat.sector, 200, 560)
    .text('Ряд - ' + ticket.seat.row, 200, 580)
    .text('Место - ' + ticket.seat.number, 200, 600);

  doc.image(png, 200, 150, {width: 200});
  doc.end();
};

let createPdfFilePipe = (ticket, png, res) => {
  return new Promise((resolve) => {
    generatePdfPage(res, ticket, png);
    return resolve(res);
  });
};

export function generateTicket(ticket, res) {
  return generateBarcodePng(ticket)
    .then(png => {
      return createPdfFilePipe(ticket, png, res);
    })
    .catch(handleError(res));
}
