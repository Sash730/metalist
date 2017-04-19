'use strict';

import app from '../..';
import Seat from '../seat/seat.model';
import request from 'supertest';

describe('Seats API:', function () {

  // add seats before testing
  before(function () {
    return createSeats();
  });

  //Clear seats after testing
  after(function () {
    Seat.remove({});
    return true;
  });

  describe('GET /api/seats/reserved-on-match/:id/sector/:sector', function () {

    it('GET should respond with a non reserved seats by sector ', function (done) {
      request(app)
        .get('/api/seats/reserved-on-match/' + '1213kjsbv' + '/sector/' + '9')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          res.body.should.be.instanceof(Array).and.have.lengthOf(2);
          done();
        });
    });
  });
});

let seats = [
  {
    slug: 's9r19st8',
    sector: '9',
    row: '19',
    seat: 8,
    reservedUntil: new Date('2019-04-27 14:56'),
    matchId: '1213kjsbv'
  },
  {
    slug: 's9r19st9',
    sector: '9',
    row: '19',
    seat: 9,
    reservedUntil: new Date('2017-03-25 14:56'),
    matchId: '1213kjsbv'
  },
  {
    slug: 's9r19st10',
    sector: '9',
    row: '19',
    seat: 10,
    reservedUntil: new Date('2019-04-25 14:56'),
    matchId: '1213kjsbv'
  },
  {
    slug: 's10r19st10',
    sector: '10',
    row: '19',
    seat: 10,
    reservedUntil: new Date('2019-04-25 14:56'),
    matchId: '1213kjsbv'
  }
];

function createSeats() {
  return Seat.remove({}).then(() => {
    return Promise.all(createSeat(seats));
  });
}

function createSeat(seats) {
  return seats.map(seat => {
    let newSeat = new Seat({
      slug: seat.slug,
      sector: seat.sector,
      row: seat.row,
      seat: seat.seat,
      reservedUntil: seat.reservedUntil,
      matchId: seat.matchId
    });
    return newSeat.save();
  });
}
