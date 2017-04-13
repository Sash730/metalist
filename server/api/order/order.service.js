'use strict';

import { Order } from './order.model';


export function findCartByPublicId(publicId) {
  return Order.findOne({publicId: publicId})
    .populate('seats');
}

export function removeOrderById(orderId) {
  return Order.findByIdAndRemove(orderId);
}
