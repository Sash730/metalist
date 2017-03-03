import {Order} from '../api/order/order.model';

export var createCart = (request, response, next) => {
    Promise.resolve(request)
        .then(request => {
          if(request.cookies.cart){
            return Order.findOne({_id: request.cookies.cart, type: 'cart'})
                        .then(cart => {
                          if (!cart) {
                            return Order.findOne({_id: request.session.cart, type: 'cart'});
                          }
                          return cart;
                        });
          }
          if(request.session.cart) {
            return Order.findOne({_id: request.session.cart, type: 'cart'});
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
