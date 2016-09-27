import {Order} from '../api/models/order.model';

export var createCart = (request, response, next) => {
    Promise.resolve(request.session.cart)
        .then(cartId => {
            if(cartId) {
                return Order.findOne({_id: cartId, type: 'cart'});
            }

            return null;
        })
        .then(cart => {
            if(cart) {
                return cart;
            }

            cart = new Order({
                type: 'cart'
            });

            return cart.save();
        })
        .then(cart => {
            request.session.cart = cart.id;
        })
        .catch((e) => {
            console.error('trying to save cart id into session', e);
        })
        .then(next)
    ;
};
