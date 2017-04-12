'use strict';

import { Order } from '../order/order.model';

export function findCartByPublicId(publicId) {
  return Order.findOne({publicId: publicId, type: 'cart'}).populate({path: 'seats'});
}
