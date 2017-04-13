'use strict';

import { Order } from './order.model';


export function findOrderByPublicId(publicId) {
  return Order.findOne({publicId: publicId});
}

export function removeOrderById(orderId) {
  return Order.findByIdAndRemove(orderId);
}
