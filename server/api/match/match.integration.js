'use strict';

import app from '../..';
import Match from '../match/match.model';
import PriceSchema from '../priceSchema/priceSchema.model';
import request from 'supertest';

describe('Match API:', function () {
  let matchId, priceSchema;
  //create priceSchema, match
  before(function () {
    return createPrice();
  });
  // Clear all after testing
  after(function () {
    return PriceSchema.remove({})
      .then(() => Match.remove({}));
  });

  describe('Match life cycle', function () {
    let usedMatch = {
      rival: 'Zarja',
      info: '12356',
      poster: 'assets/teamLogo/6.png',
      priceSchema: priceSchema,
      date: new Date('2017-04-10 14:56')
    };

    it('POST /api/matches/: should respond with a status 200 and new match', function (done) {
      request(app)
        .post('/api/matches')
        .send( {
          rival: 'Dynamo',
          info: '123',
          poster: 'assets/teamLogo/3.png',
          priceSchema: priceSchema,
          date: new Date('2019-04-25 14:56')
        })
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            matchId = res.body.id;

            res.body.rival.toString().should.equal('Dynamo');
            res.body.should.have.property('headline');
            res.body.headline.toString().should.equal('Металлист 1925 - Dynamo');
            res.body.info.toString().should.equal('123');
            ///res.body.date.toString().should.equal('2019-04-25T11:56:00.000Z');
            res.body.priceSchema.toString().should.equal(priceSchema.id);

            done();
          }
        });
    });

    it('GET /api/matches/:id : should respond with a match consist of params id', function (done) {
      request(app)
        .get('/api/matches/' + matchId)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          res.body.rival.toString().should.equal('Dynamo');
          res.body.should.have.property('headline');
          res.body.headline.toString().should.equal('Металлист 1925 - Dynamo');
          res.body.info.toString().should.equal('123');
          //res.body.date.toString().should.equal('2019-04-25T11:56:00.000Z');
          res.body.priceSchema.id.toString().should.equal(priceSchema.id);

          done();
        });
    });

    it('PUT /api/matches/:id : should respond with a status 200 and update match', function (done) {
      request(app)
        .put('/api/matches/' + matchId)
        .send({
          rival: 'Dynamo',
          info: '456',
          poster: 'assets/teamLogo/3.png',
          priceSchema: priceSchema,
          date: new Date('2019-05-10 19:25')
        })
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.body.rival.toString().should.equal('Dynamo');
            res.body.should.have.property('headline');
            res.body.headline.toString().should.equal('Металлист 1925 - Dynamo');
            res.body.info.toString().should.equal('456');
            //res.body.date.toString().should.equal('2019-05-10T16:25:00.000Z');
            res.body.priceSchema.toString().should.equal(priceSchema.id);
            done();
          }
        });
    });

    it('DELETE /api/matches/:id : should respond with a status 204', function (done) {
      request(app)
        .delete('/api/matches/' + matchId)
        .expect(204)
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            done();
          }
        });
    });

    it('GET /api/matches/: should respond with a status 200 and empty array', function (done) {
      request(app)
        .get('/api/matches')
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.body.should.be.instanceof(Array).and.have.lengthOf(0);

            done();
          }
        });
    });

  });

  describe('Matches output', function () {
    before(function () {
      return createMatches();
    });

    it('GET /api/matches/: should respond with a status 200 and empty array', function (done) {
      request(app)
        .get('/api/matches')
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.body.should.be.instanceof(Array).and.have.lengthOf(2);

            done();
          }
        });
    });

  });

  let matches = [
    {
      rival: 'Zarja',
      info: '12356',
      poster: 'assets/teamLogo/6.png',
      priceSchema: priceSchema,
      date: new Date('2017-04-10 14:56')
    },
    {
      rival: 'Dynamo',
      info: '123',
      poster: 'assets/teamLogo/3.png',
      priceSchema: priceSchema,
      date: new Date('2019-04-25 14:56')
    },
    {
      rival: 'Victoria',
      info: '258',
      poster: 'assets/teamLogo/4.png',
      priceSchema: priceSchema
    }
  ];

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

  function createMatches() {
    return Match.remove({}).then(() => {
      return Promise.all(createMatch(matches));
    });
  }

 function createMatch(matches) {
    return matches.map(match => {
      let newMatch = new Match({
        rival: match.rival,
        info: match.info,
        poster: match.poster,
        priceSchema: match.priceSchema,
        date: match.date
      });
      return newMatch.save();
    })
 }
});
