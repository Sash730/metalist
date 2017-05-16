'use strict';

import app from '../..';
import Match from '../match/match.model';
import Order from '../order/order.model';
import PriceSchema from '../priceSchema/priceSchema.model';
import Seat from '../seat/seat.model';
import request from 'supertest';

describe('Cart API:', function () {
  let publicId, matchId, priceId;
  //create priceSchema, match and seat
  before(function () {
    return createPrice()
      .then(createMatch)
      .then(createSeat);
  });
  // Clear all after testing
  after(function () {
    return Order.remove({})
      .then(() => PriceSchema.remove({}))
      .then(() => Match.remove({}))
      .then(() => Seat.remove({}));
  });

  describe('GET /api/carts/', function () {

    it('GET /api/carts/my-cart: should respond with a status 404 when cart not exists', function (done) {
      request(app)
        .get('/api/carts/my-cart')
        .expect(404)
        .end((err) => {
          if (err) {
            done(err);
          } else {
            done();
          }
        });
    });

    it('POST /api/carts/: should respond with a cart with new public id and default fields', function (done) {
      request(app)
        .post('/api/carts/')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          publicId = res.body.publicId;

          res.body.price.should.equal(0);
          res.body.should.have.property('publicId');
          res.body.status.toString().should.equal('new');
          res.body.type.toString().should.equal('cart');
          res.body.should.have.property('tickets').with.lengthOf(0);
          res.body.should.have.property('seats').with.lengthOf(0);
          res.body.should.have.property('created');

          done();
        });
    });

    it('GET /api/carts/my-cart: should respond with cart when cookie cart exists', function (done) {
      request(app)
        .get('/api/carts/my-cart')
        .set('Cookie', 'cart=' + publicId)
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.body.price.should.equal(0);
            res.body.publicId.toString().should.equal(publicId);
            res.body.status.toString().should.equal('new');
            res.body.type.toString().should.equal('cart');
            res.body.should.have.property('tickets').with.lengthOf(0);
            res.body.should.have.property('seats').with.lengthOf(0);
            res.body.should.have.property('created');
            done();
          }
        });
    });
  });

  describe('POST /api/carts/addSeat', function () {

    it('POST /api/carts/addSeats: should respond with a status 200 and update cart', function (done) {
      request(app)
        .post('/api/carts/addSeat')
        .send({
          slug: 's9r19st8',
          matchId: matchId
        })
        .set('Cookie', 'cart=' + publicId)
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.body.seats[0].price.toString().should.equal('20');
            res.body.seats[0].reservedByCart.toString().should.equal(publicId);
            res.body.seats[0].reservationType.toString().should.equal('RESERVE');
            res.body.seats[0].isReserved.toString().should.equal('true');
            res.body.size.should.equal(1);
            res.body.price.should.equal(0);
            res.body.should.have.property('publicId');
            res.body.status.toString().should.equal('new');
            res.body.type.toString().should.equal('cart');
            res.body.should.have.property('tickets').with.lengthOf(0);
            res.body.should.have.property('seats').with.lengthOf(1);
            res.body.should.have.property('created');
            done();
          }
        });
    });

    it('POST /api/carts/addSeats: should respond with a status 409 when seat already taken.', function (done) {
      request(app)
        .post('/api/carts/addSeat')
        .send({
          slug: 's9r19st8',
          matchId: matchId
        })
        .set('Cookie', 'cart=' + publicId)
        .expect(409)
        .end((err) => {
          if (err) {
            done(err);
          } else {
            done();
          }
        });
    });

    it('DELETE /api/carts/match/:matchId/seat/:slug : should respond with a cart with seats length null', function (done) {
      request(app)
        .delete('/api/carts/match/' + matchId + '/seat/s9r19st8')
        .set('Cookie', 'cart=' + publicId)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          res.body.should.have.property('publicId');
          res.body.price.should.equal(0);
          res.body.status.toString().should.equal('new');
          res.body.type.toString().should.equal('cart');
          res.body.should.have.property('tickets').with.lengthOf(0);
          res.body.should.have.property('seats').with.lengthOf(0);
          res.body.should.have.property('created');
          done();
        });
    });
  });
  function createSeat() {
    return Seat.remove({}).then(function () {
      let seat = new Seat({
        slug: 's9r19st8',
        tribune: 'west',
        sector: '9',
        row: '19',
        seat: 8,
        match: matchId,
        reservedUntil: new Date()
      });
      return seat.save();
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
          priceId = price.id;
          return price;
        });
    });
  }

  function createMatch() {
    return Match.remove({}).then(function () {
      let match = new Match({
        rival: 'Dynamo',
        info: '123',
        priceSchema: priceId,
        date: new Date()
      });
      return match.save()
        .then(match => {
          matchId = match.id;
          return match;
        });
    });
  }
});
