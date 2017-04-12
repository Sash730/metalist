'use strict';

import  PriceSchema  from './priceSchema.model';

export function findPriceSchemaById(priceSchemaId) {
  return PriceSchema.findOne({_id: priceSchemaId});
}
