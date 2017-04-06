'use strict';

class Cart {

    constructor() {
        this._tickets = [];
    }

    get tickets() {
        return this._tickets;
    }

    set tickets(tickets) {
        this._tickets = tickets;
    }

    get amount() {
        return this._tickets.reduce((amount, ticket) => {
            return amount + ticket.amount;
        }, 0);
    }

    get size() {
        return this._tickets.length;
    }
}
