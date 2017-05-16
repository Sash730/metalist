'use strict';

import app from '../..';
import SeasonTicket from '../seasonTicket/seasonTicket.model';
import User from '../user/user.model';
import request from 'supertest';
import moment from 'moment';

describe('Season ticket API:', function () {
  let token, ticket, slug;

  // Clear users before testing
  before(function () {
    return SeasonTicket.remove({})
      .then(createUser);
  });

  //Clear seats after testing
  after(function () {
    return User.remove({})
      .then(() => SeasonTicket.remove({}));
  });

  describe('GET /api/seasonTicket/', function () {
    ticket = {
          sector: '10',
          row: '19',
          seat: '8',
          reservedUntil: moment().add(1, 'days')
        };
    slug = 's9r19st8';

    before(function (done) {
      request(app)
        .post('/auth/local')
        .send({
          email: 'admin@example.com',
          password: 'admin'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          token = res.body.token;
          done();
        });
    });

    it('POST /api/seasonTicket/:slug should respond with a create seat', function (done) {
      request(app)
        .post('/api/seasonTicket/'  + slug )
        .set('authorization', 'Bearer ' + token)
        .send({ ticket: ticket })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          res.body.sector.toString().should.equal('10');
          res.body.row.toString().should.equal('19');
          res.body.seat.toString().should.equal('8');
          done();
        });
    });

    it('POST should respond with 409', function (done) {
      request(app)
        .post('/api/seasonTicket/' + slug)
        .set('authorization', 'Bearer ' + token)
        //.type('json')
        .send({ ticket: ticket })
        .expect(409)
        .end((err) => {
          if(err) {
            done(err);
          } else {
            done();
          }
        });
    });

    it('GET should respond with a seat', function (done) {
      request(app)
        .get('/api/seasonTicket/season-tickets')
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          res.body.should.have.length(1);
          done();
        });
    });

    it('DELETE should respond with a status 204 when seat are deleted', function (done) {
      request(app)
        .delete('/api/seasonTicket/' + slug)
        .set('authorization', 'Bearer ' + token)
        .expect(204)
        .end((err) => {
          if(err) {
            done(err);
          } else {
            done();
          }
        });
    });

    it('GET /api/seasonTicket/: should respond with a empty array when there are no seats', function (done) {
      request(app)
        .get('/api/seasonTicket/season-tickets')
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .end((err, res) => {
          res.body.should.have.length(0);
          done();
        });
    });
  });


  describe('GET /api/seasonTicket/addBlock/sector/:sector/row/:row', function () {
    let blockRow = {
      sector: '10',
      row: '19',
      reservedUntil: moment().add(1, 'days')
    };

    before(function (done) {
      request(app)
        .post('/auth/local')
        .send({
          email: 'admin@example.com',
          password: 'admin'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          token = res.body.token;
          done();
        });
    });

    it('POST to /api/seasonTicket/: should respond with a create season seat', function (done) {
      request(app)
        .post('/api/seasonTicket/' + slug)
        .set('authorization', 'Bearer ' + token)
        .send({ ticket: ticket })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          res.body.sector.toString().should.equal('10');
          res.body.row.toString().should.equal('19');
          res.body.seat.toString().should.equal('8');
          done();
        });
    });

    it('POST to /api/seasonTicket/addBlock/: should respond with a create block row seat without season-tickets', function (done) {
      request(app)
        .post('/api/seasonTicket/addBlock/sector/' + blockRow.sector + '/row/' + blockRow.row)
        .set('authorization', 'Bearer ' + token)
        .send({ blockRow: blockRow })
        .expect(200)
        .end((err) => {
          if (err) {
            done(err);
          } else {
            done();
          }
        });
    });

    it('DELETE /api/seasonTicket/deleteBlock/: should respond with a status 204 when block row seats are deleted', function (done) {
      request(app)
        .delete('/api/seasonTicket/deleteBlock/sector/' + blockRow.sector + '/row/' + blockRow.row)
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .end((err) => {
          if (err) {
            done(err);
          } else {
            done();
          }
        });
    });

    it('GET /api/seasonTicket: should respond with a season-ticket seat', function (done) {
      request(app)
        .get('/api/seasonTicket/season-tickets')
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          res.body.should.have.length(1);
          res.body[0].sector.toString().should.equal('10');
          res.body[0].row.toString().should.equal('19');
          res.body[0].seat.should.equal(8);
          res.body[0].reservationType.should.equal('SEASON_TICKET');
          done();
        });
    });

  });
 });

function createUser() {
  return User.remove({}).then(function () {
    let user = new User({
      name: 'Fake Admin',
      email: 'admin@example.com',
      password: 'admin',
      provider: 'local',
      role: 'admin'
    });

    return user.save();
  });
}
