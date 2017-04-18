'use strict';

import  PriceSchema  from './priceSchema.model';
import * as matchService from '../match/match.service';

export function findPriceSchemaById(priceSchemaId) {
  return PriceSchema.findOne({_id: priceSchemaId});
}

export function getSeatPrice(seat) {
  return matchService.findById(seat.matchId)
    .then(match => findPriceSchemaById(match.priceSchema) )
    .then(priceSchema => getPrice(priceSchema, seat) );
}

function getPrice(priceSchema, seat) {
  let schema = priceSchema.priceSchema,
    tribuneName = seat.tribune,
    sectorName = seat.sector;

  if (!schema['tribune_' + tribuneName]) {
    throw new Error('Price not found');
  }
  if (schema['tribune_' + tribuneName]['sector_' + sectorName]) {
    let price = schema['tribune_' + tribuneName]['sector_' + sectorName].price;

    if (!price) {
      return schema['tribune_' + tribuneName].price;
    }
    return price;
  } else {
    return schema['tribune_' + tribuneName].price;
  }
}
