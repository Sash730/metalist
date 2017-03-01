'use strict';
import * as barcode from 'bwip-js';
import * as fs from 'fs';
import moment from 'moment';
import * as log4js from 'log4js';

var logger = log4js.getLogger('createPdfFile');
var PDFDocument = require('pdfkit');

function createPdfFile(ticket, png, cb) {
  var doc = new PDFDocument();
  doc.pipe(fs.createWriteStream('./server/pdfGenerator/temp/'+ticket.accessCode+'.pdf'));

  doc.image('./server/pdfGenerator/ticket.png', 0, 0, {width:600});
  doc.fontSize(20)
    .text('Match - ' +ticket.match.headline, 180, 240)
    .text('Date - ' + moment(ticket.match.date).format('MMM d, HH:mm'), 180, 260)
    .text('Sector - ' +ticket.seat.sector, 200, 560)
    .text('Row - ' +ticket.seat.row, 200, 580)
    .text(ticket.match, 200, 600);

  doc.image(png, 200, 150, {width:200});
  doc.end();

  cb(null);
}
export function ticketBySendMail(ticket, callback) {
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
      logger.error('ticketBySendMail '+err);
    } else {
      createPdfFile(ticket, png, function (err, res) {
        if (err) {
          logger.error('createPdfFile '+err);
        }
        else {
          callback(null, res);
        }
      })
    }
  });

}
