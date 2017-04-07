'use strict';

class Cart {

    constructor() {
        this._seats = [];
    }

    get seats() {
        return this._seats;
    }

    set seats(seats) {
        this._seats = seats;
    }

    get amount() {
        return this._seats.reduce((amount, seat) => {
            return amount + seat.amount;
        }, 0);
    }

    get size() {
        return this._seats.length;
    }
}
