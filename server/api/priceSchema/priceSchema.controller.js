'use strict';

import PriceSchema from "./priceSchema.model";
import * as log4js from 'log4js';

let logger = log4js.getLogger('PriceSchema');

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      logger.info('respondWithResult ' + entity._id);
      return res.status(statusCode).json(entity);
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    logger.error('handleError '+err);
    res.status(statusCode).send(err);
  };
}

export function index(req, res) {
  return PriceSchema.find({}).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function savePriceSchema(req, res) {
  let priceSchema = req.body.schema;

  PriceSchema.findOne({'priceSchema.name': priceSchema.name})
    .then((price)  => {
      if (!price) {
        let newPrice = new PriceSchema({
          priceSchema: priceSchema
        });
        return newPrice.save();
      }
      price.priceSchema = priceSchema;

      return price.save();
    })
    .then(respondWithResult(res))
    .catch(handleError(res))
  ;
}

export function view(req, res) {
  return PriceSchema.findById(req.params.id).exec()
  // .then(matches => {
  //     var result = _.map(matches, (match) => {
  //
  //         return match;
  //
  //         // return {
  //         //     '_id': match.id,
  //         // };
  //     });
  //
  //     return res.status(200).json(result);
  // })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function deletePrice(req, res) {
  return PriceSchema.findByIdAndRemove(req.params.id).exec()
    .then(function () {
      res.status(204).end();
    })
    .catch(handleError(res));
}
