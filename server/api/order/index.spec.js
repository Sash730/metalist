'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var orderCtrlStub = {
  updateCart: 'orderCtrl.updateCart',
  getCart: 'orderCtrl.getCart',
  getUserCart: 'orderCtrl.getUserCart',
  deleteItemFromCart: 'orderCtrl.deleteItemFromCart',
  convertCartToOrder: 'orderCtrl.convertCartToOrder',
  liqpayRedirect: 'orderCtrl.liqpayRedirect',
  liqpayCallback: 'orderCtrl.liqpayCallback',
  getMyOrders: 'orderCtrl.getMyOrders',
  getOrderByNumber: 'orderCtrl.getOrderByNumber',
  getOrderedTickets: 'orderCtrl.getOrderedTickets',
};

var authServiceStub = {
  isAuthenticated() {
    return 'authService.isAuthenticated';
  },
  hasRole(role) {
    return 'authService.hasRole.' + role;
  }
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var orderIndex = proxyquire('./index', {
  'express': {
    Router() {
      return routerStub;
    }
  },
  './order.controller': orderCtrlStub,
  '../../auth/auth.service': authServiceStub
});

describe('Order API Router:', function () {

  it('should return an express router instance', function () {
    orderIndex.should.equal(routerStub);
  });

  describe('GET /api/orders/cart', function () {

    it('should route to order.controller.getCart', function () {
      routerStub.get
        .withArgs('/cart', 'orderCtrl.getCart')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/orders/cart', function () {

    it('should route to order.controller.updateCart', function () {
      routerStub.post
        .withArgs('/cart', 'orderCtrl.updateCart')
        .should.have.been.calledOnce;
    });
  });

  describe('GET /api/orders/user-cart', function () {

    it('should be authenticated and route to user.controller.getUserCart', function () {
      routerStub.get
        .withArgs('/user-cart', 'authService.isAuthenticated', 'orderCtrl.getUserCart')
        .should.have.been.calledOnce;
    });
  });

  describe('DELETE /api/orders/cart/tickets/:seatId', function () {

    it('should route to order.controller.deleteItemFromCart', function () {
      routerStub.delete
        .withArgs('/cart/tickets/:seatId', 'orderCtrl.deleteItemFromCart')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/orders/cart/convert', function () {

    it('should be authenticated and route to order.controller.convertCartToOrder', function () {
      routerStub.post
        .withArgs('/cart/convert', 'authService.isAuthenticated', 'orderCtrl.convertCartToOrder')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/orders/liqpay-redirect', function () {

    it('should be authenticated and route to order.controller.liqpayRedirect', function () {
      routerStub.post
        .withArgs('/liqpay-redirect', 'orderCtrl.liqpayRedirect')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/orders/liqpay-callback', function () {

    it('should be authenticated and route to order.controller.liqpayCallback', function () {
      routerStub.post
        .withArgs('/liqpay-callback', 'orderCtrl.liqpayCallback')
        .should.have.been.calledOnce;
    });
  });

  describe('GET /api/orders/my', function () {

    it('should be authenticated and route to user.controller.getMyOrders', function () {
      routerStub.get
        .withArgs('/my', 'authService.isAuthenticated', 'orderCtrl.getMyOrders')
        .should.have.been.calledOnce;
    });
  });

  describe('GET /api/orders/by-number/:orderNumber', function () {

    it('should be authenticated and route to user.controller.getOrderByNumber', function () {
      routerStub.get
        .withArgs('/by-number/:orderNumber', 'authService.isAuthenticated', 'orderCtrl.getOrderByNumber')
        .should.have.been.calledOnce;
    });
  });

  describe('GET /api/orders/by-number/:orderNumber/tickets', function () {

    it('should be authenticated and route to user.controller.getOrderedTickets', function () {
      routerStub.get
        .withArgs('/by-number/:orderNumber/tickets', 'authService.isAuthenticated', 'orderCtrl.getOrderedTickets')
        .should.have.been.calledOnce;
    });
  });
});
