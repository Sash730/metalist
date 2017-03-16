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

let generatePdfPage = (res, ticket, png) => {
  let doc = new PDFDocument();
  doc.pipe(res);
  doc.image(__dirname + '/ticket.png', 0, 0, {width: 600});
  doc.font(__dirname + '/fonts/OpenSans-Bold.ttf');
  doc.fontSize(10)


    .text('Трибуна: ', 400, 45)
    .text('Сектор: ', 400, 65)
    .text('Ряд: ', 400, 85)
    .text('Мiсце: ', 400, 105)

  doc.fontSize(16)
    .text( moment(ticket.match.date).format('DD.MM.YYYY HH:mm'), 250, 10)
    .text(ticket.match.headline, 230, 180)
    .text( ticket.seat.tribune, 455, 39)
    .text( ticket.seat.sector, 455, 60)
    .text( ticket.seat.row, 455, 81)
    .text( ticket.seat.number, 455, 102);


  doc.fontSize(10)
    .text('ОСК "Металiст"', 130, 53)
    .text('м. Харкiв', 146, 68)
    .text('вул. Плеханiвська, 65', 115, 80)
    .text('Цiна:  ' + ticket.amount/100 + ' грн.', 140, 120);


  doc.rotate(90)
    .image(png, 25, -80, {width: 170});
  doc.fontSize(9).text( ticket.ticketNumber, 25, -100);

  doc
    .fontSize(12)
    .text('        ЧЕМПІОНАТ УКРАЇНИ\n          З ФУТБОЛУ СЕРЕД\n              АМАТОРСЬКИХ\n         КОМАНД 2016-2017', 10, -570);

  doc.end();
}
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
