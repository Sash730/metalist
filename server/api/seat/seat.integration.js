'use strict';

import app from '../..';
import Match from '../match/match.model';
import Seat from '../seat/seat.model';
import PriceSchema from '../priceSchema/priceSchema.model';
import request from 'supertest';

describe('Seats API:', function () {

  // add seats before testing
  before(function () {
    return  Match.remove({})
      .then(createPrice)
      .then(createMatch)
      .then((match) => createSeats(match.id))
      .then(createOtherMatch)
      .then((match) => createSeats(match.id));
  });

  //Clear seats after testing
  after(function () {
    return Seat.remove({})
    .then(() => Match.remove({}))
    .then(() => PriceSchema.remove({}));
  });

  describe('GET /api/seats/reserved-on-match/:id/sector/:sector', function () {
    it('GET should respond with a reserved seats by sector ', function (done) {
      request(app)
        .get('/api/seats/reserved-on-match/' + matchId + '/sector/' + '9')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          res.body.should.have.length(3);
          done();
        });
    });
    it('GET should respond with a reserved seats by sector for other match', function (done) {
      request(app)
        .get('/api/seats/reserved-on-match/' + otherMatchId + '/sector/' + '9')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          res.body.should.have.length(3);
          done();
        });
    });
  });
});

let matchId, otherMatchId, priceSchema;
let seats = [
  {
    slug: 's9r19st8',
    sector: '9',
    row: '19',
    seat: 8,
    reservedUntil: new Date('2019-04-27 14:56'),
    //match: matchId
  },
  {
    slug: 's9r19st9',
    sector: '9',
    row: '19',
    seat: 9,
    reservedUntil: new Date('2019-03-25 14:56')
  },
  {
    slug: 's9r19st10',
    sector: '9',
    row: '19',
    seat: 10,
    reservedUntil: new Date('2019-04-25 14:56')
  },
  {
    slug: 's10r19st10',
    sector: '10',
    row: '19',
    seat: 10,
    reservedUntil: new Date('2019-04-25 14:56')
  }
];

function createSeats(id) {
  return Promise.all(createSeat(seats, id));
}

function createSeat(seats, id) {
  return seats.map(seat => {
    let newSeat = new Seat({
      slug: seat.slug,
      sector: seat.sector,
      row: seat.row,
      seat: seat.seat,
      reservedUntil: seat.reservedUntil,
      match: id
    });

    return newSeat.save();
  });
}

function createMatch() {

  let newMatch = new Match({
    rival: 'Dynamo',
    priceSchema: priceSchema,
    date: new Date('2019-04-25 14:56')
  });
  return newMatch.save()
    .then(match => {
      matchId = match.id;
      return match;
    });
}

function createOtherMatch() {

  let newMatch = new Match({
    rival: 'Dynamo',
    priceSchema: priceSchema,
    date: new Date('2019-05-25 14:56')
  });
  return newMatch.save()
    .then(match => {
      otherMatchId = match.id;
      return match;
    });
}

function createPrice() {
  return PriceSchema.remove({}).then(function () {
    let price = new PriceSchema({
      priceSchema: {
        name: 'amators',
        tribune_west: {
          name: 'west',
          price: 20
        }
      }
    });
    return price.save()
      .then(price => {
        priceSchema = price;
        return price;
      });
  });
}
