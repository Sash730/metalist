'use strict';

import app from '../..';
import { Order } from '../order/order.model';
import request from 'supertest';

describe('Cart API:', function () {

  // Clear users after testing
  after(function () {
    return Order.remove();
  });

  describe('GET /api/carts/', function () {
    let publicId;

    before(function (done) {
      request(app)
        .post('/api/carts/')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          publicId = res.body.publicId;
          done();
        });
    });

    it('should respond with a cart when publicId exists and is valid', function (done) {
      request(app)
        .get('/api/carts/cart/' + publicId)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          res.body.publicId.toString().should.equal(publicId.toString());
          done();
        });
    });

    it('should respond with a status 404 when publicId not valid', function (done) {
      request(app)
        .get('/api/carts/cart/' + '345678')
        .expect(404)
        .end((err) => {
          if(err) {
            done(err);
          } else {
            done();
          }
        });
    });

    it('should respond with a cart with new public id and default fields', function (done) {
      request(app)
        .post('/api/carts/')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          res.body.publicId.toString().should.not.equal(publicId.toString());
          res.body.amount.should.equal(0);
          res.body.status.toString().should.equal('new');
          res.body.type.toString().should.equal('cart');
          res.body.should.have.property('tickets').with.lengthOf(0);
          res.body.should.have.property('seats').with.lengthOf(0);
          res.body.should.have.property('created');

          done();
        });
    });
  });
});
