'use strict';

import Seat from '../seat/seat.model';

  export function createRowSeats(tribuneName, sectorName, row) {
   return getRowSeats(row.seats)
     .then(seats => {
       return seats.forEach(seat => {
         return createSeat(tribuneName, sectorName, row.name, seat);
       })
     });
  }

  function getRowSeats(seats) {
    return new Promise((resolve) => {
      resolve ([...Array(parseInt(seats) + 1).keys()].filter(Boolean));
    });
  }

  function createSeat(tribuneName, sectorName, rowName, seat) {
    let slug =  's' + sectorName + 'r' + rowName + 'st' + seat;

    let newSeat = new Seat({
       slug: slug,
       tribune: tribuneName,
       sector: sectorName,
       row: rowName,
       seat: seat
    });
    return newSeat.save();
  }
