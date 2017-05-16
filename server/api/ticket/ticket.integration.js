'use strict';

import app from '../..';
import Ticket from '../ticket/ticket.model';
import Seat from '../seat/seat.model';
import User from '../user/user.model';
import Match from '../match/match.model';
import request from 'supertest';
import * as crypto  from 'crypto';

describe('Ticket API:', function () {
  let token;

  // Clear users before testing
  before(function () {
    return createMatch()
      .then(match => {
        return Promise.all([
          createSeat(newSeats),
          Promise.resolve(match)
        ]);
      })
      .then(([seats, match]) => createTickets(seats, match) )
      .then(createUser);
  });

  //Clear seats after testing
  after(function () {
    return User.remove({})
      .then(() => Seat.remove({}))
      .then(() => Match.remove({}))
      .then(() => Ticket.remove({}));
  });

  describe('GET /api/tickets', function () {

    before(function (done) {
      request(app)
        .post('/auth/local')
        .send({
          email: 'user@example.com',
          password: 'user'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          token = res.body.token;
          done();
        });
    });

    after(function () {
      return createStewardUser();
    });

    it('GET /api/tickets/my: should respond with a user tickets', function (done) {
      request(app)
        .get('/api/tickets/my')
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          res.body.should.have.length(2);
          done();
        });
    });

    it('GET /api/tickets/sold-tickets : should respond with 403', function (done) {
      request(app)
        .get('/api/tickets/sold-tickets')
        .set('authorization', 'Bearer ' + token)
        .expect(403)
        .end((err) => {
          if(err) {
            done(err);
          } else {
            done();
          }
        });
    });

    it('GET /api/tickets/tribune/:tribune/code/:code : should respond with 403', function (done) {
      request(app)
        .get('/api/tickets/tribune/' + 'west' + '/code/' + 'code')
        .set('authorization', 'Bearer ' + token)
        .expect(403)
        .end((err) => {
          if(err) {
            done(err);
          } else {
            done();
          }
        });
    });

    it('GET /api/tickets/count/:tribune : should respond with 403', function (done) {
      request(app)
        .get('/api/tickets/count/' + 'west')
        .set('authorization', 'Bearer ' + token)
        .expect(403)
        .end((err) => {
          if(err) {
            done(err);
          } else {
            done();
          }
        });
    });
  });


  describe('GET tickets for steward', function () {

    before(function (done) {
          request(app)
            .post('/auth/local')
            .send({
              email: 'steward@example.com',
              password: 'steward'
            })
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
              token = res.body.token;
              done();
            });
    });

    after(function () {
      User.remove({});
      Ticket.remove({});
      return true;
    });

    it('GET /api/tickets/sold-tickets : should respond with sold tickets', function (done) {
      request(app)
        .get('/api/tickets/sold-tickets')
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            done(err);
          } else {
            res.body.should.have.length(3);
            done();
          }
        });
    });

    it('GET /api/tickets/tribune/:tribune/code/:code : should respond with status 200', function (done) {
      request(app)
        .get('/api/tickets/tribune/' + 'west' + '/code/' + 's91910')
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .end((err, res) => {
          if(err) {
            done(err);
          } else {
            res.body.ticket.headLine.toString().should.equal('Металлист 1925 - Dynamo');
            res.body.ticket.tribune.toString().should.equal('west');
            res.body.ticket.row.toString().should.equal('19');
            res.body.ticket.sector.toString().should.equal('9');
            res.body.ticket.seat.toString().should.equal('10');
            res.body.should.have.property('count');
            done();
          }
        });
    });

    it('GET /api/tickets/tribune/:tribune/code/:code : should respond with message "Билет не действительный."', function (done) {
      request(app)
        .get('/api/tickets/tribune/' + 'west' + '/code/' + 's91910')
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .end((err, res) => {
          if(err) {
            done(err);
          } else {
            res.body.count.toString().should.equal('0');
            res.body.message.toString().should.equal('Билет не действительный.');
            done();
          }
        });
    });

    it('GET /api/tickets/tribune/:tribune/code/:code : should respond with message "Другая трибуна"', function (done) {
      request(app)
        .get('/api/tickets/tribune/' + 'east' + '/code/' + 's101910')
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .end((err, res) => {
          if(err) {
            done(err);
          } else {
            res.body.ticket.headLine.toString().should.equal('Металлист 1925 - Dynamo');
            res.body.ticket.tribune.toString().should.equal('north');
            res.body.ticket.row.toString().should.equal('19');
            res.body.ticket.sector.toString().should.equal('10');
            res.body.ticket.seat.toString().should.equal('10');
            res.body.count.toString().should.equal('1');
            res.body.message.toString().should.equal('Другая трибуна');
            done();
          }
        });
    });

    it('GET /api/tickets/tribune/:tribune/code/:code : should respond with message "Билет не действительный."', function (done) {
      request(app)
        .get('/api/tickets/tribune/' + 'west' + '/code/' + 's9193410')
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .end((err, res) => {
          if(err) {
            done(err);
          } else {
            res.body.count.toString().should.equal('0');
            res.body.message.toString().should.equal('Билет не действительный.');
            done();
          }
        });
    });
  });
let matchId;
  let newSeats = [
    {
      slug: 's9r19st8',
      tribune: 'east',
      sector: '22',
      row: '19',
      seat: 8,
      reservedUntil: new Date('2019-04-27 14:56'),
      match: matchId
    },
    {
      slug: 's9r19st10',
      tribune: 'west',
      sector: '9',
      row: '19',
      seat: 10,
      reservedUntil: new Date('2019-04-25 14:56'),
      match: matchId
    },
    {
      slug: 's10r19st10',
      tribune: 'north',
      sector: '10',
      row: '19',
      seat: 10,
      reservedUntil: new Date('2019-04-25 14:56'),
      match: matchId
    }
  ];



  function createStewardUser() {
    return User.remove({}).then(function () {
      let user = new User({
        name: 'Fake Steward',
        email: 'steward@example.com',
        password: 'steward',
        provider: 'local',
        role: 'steward'
      });

      return user.save();
    });
  }

  function createUser(tickets) {
    const [one, ...userTickets] = tickets;

    return User.remove({}).then(function () {
      let user = new User({
        name: 'User',
        email: 'user@example.com',
        password: 'user',
        provider: 'local',
        role: 'user',
        tickets: userTickets
      });

      return user.save();
    });
  }

  function createMatch() {
      let newMatch = new Match({
        rival: 'Dynamo',
        info: '123',
        poster: 'assets/teamLogo/3.png',
        date: new Date('2019-05-20 14:56')
      });
      return newMatch.save()
        .then(match => {
          matchId = match.id;
          return match;
        });
  }

  function createSeat(seats) {
    return Promise.all(seats.map(seat => {
      let newSeat = new Seat({
        slug: seat.slug,
        tribune: seat.tribune,
        sector: seat.sector,
        row: seat.row,
        seat: seat.seat,
        reservedUntil: seat.reservedUntil,
        matchId: seat.matchId
      });
      return newSeat.save();
    }));
  }

  function createTickets(seats, match) {
    return Ticket.remove({}).then(() => {
      return Promise.all(createTicket(seats, match));
    });
  }

  function createTicket(seats, match) {
    return seats.map(seat => {
      let code = 's' + seat.sector + seat.row + seat.seat;
      let newTicket = new Ticket({
        seat: {
          id: seat.id,
          tribune: seat.tribune,
          sector: seat.sector,
          row: seat.row,
          seat: seat.seat
        },
        accessCode: code,
        amount: 40,
        status: 'paid',
        ticketNumber: crypto.randomBytes(20).toString('hex'),
        match: {
          id: match.id,
          headline: match.headline,
          date: match.date
        }
      });
      return newTicket.save();
    });
  }
});
