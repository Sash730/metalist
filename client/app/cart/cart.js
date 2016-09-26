'use strict';

class Cart {

    constructor() {
        this._items = []
    }

    get items() {
        return this._items;
    }

    set items(items) {
        this._items = items;
    }

    get amount() {
        return _.reduce(this._items, (amount, item) => {
            return amount + item.amount;
        }, 0);
    }

    get size() {
        return this._items.length;
    }
}
