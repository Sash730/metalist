let tribunes = [
  {
    name: 'north',
    sectors: ['10', '11', '12', '16']
  },
  {
    name: 'west',
    sectors: ['1', '2', '3']
  },
  {
    name: 'east',
    sectors: ['22', '23']
  }
];

let sectors = [
  {
    name: '1',
    rows: [
      {
        name: '1',
        seats: [
          {
            name: '1'
          }, {
            name: '2'
          }, {
            name: '3'
          }
        ]
      }, {
        name: '2',
        seats: [
          {
            name: '1'
          }, {
            name: '2'
          }, {
            name: '3'
          }
        ]
      }
    ]
  }
];

let simplePriceSchema = {
  tribunes: [
    {
      name: 'west',
      price: 10
    },
    {
      name: 'north',
      price: 20
    }
  ],
  sectors: [
    {
      name: '16',
      price: 40
    },
    {
      name: '22',
      price: 50
    }
  ]
};

let colors = [
  {color: '#ff972f', colorName: '1', price: '10'},
  {color: '#ffcc00', colorName: '2', price: '20'},
  {color: '#54aa6a', colorName: '3', price: '30'},
  {color: '#6f89c0', colorName: '4', price: '40'},
  {color: '#6f89c0', colorName: '5', price: '50'},
  {color: '#a1a6b0', colorName: '6', price: '100'},
  {color: '#d4d4d4', colorName: 'red', price: '150'}
];

let availableSectors = {
  1: ['1','2'],
  2: ['3','5'],
  3: [],
  12: [],
  16: [],

};


function getTribuneNameBySectorName(sectorName) {
  let [ tribune ] = tribunes.filter(tribune => tribune.sectors.includes(sectorName));
  if ( tribune ) return tribune.name;
  return false;
}

function getSectorByName(sectorName) {
  let [ sector ] = sectors.filter(sector => sector.name === sectorName);
  return sector;
}

function isSectorAvalable(sectorName) {
  return availableSectors.hasOwnProperty(sectorName);
}

function isSectorRowAvailable(sector, row) {
  if (!isSectorAvalable(sector)) return false;

  return availableSectors[sector].includes(row)
}

function getSectorPriceFromPriceSchema(sectorName) {
  let [ sector ] = simplePriceSchema.sectors.filter(sector => sector.name === sectorName);
  if ( sector ) return sector.price;

  let [ tribune ] = simplePriceSchema.tribunes.filter(tribune => tribune.name === getTribuneNameBySectorName(sectorName));
  if ( tribune ) return tribune.price;

  return false;
}

function getSectorPrice(sectorName) {
  return isSectorAvalable(sectorName) ? getSectorPriceFromPriceSchema(sectorName) : false;
}

function getColorByPrice(price) {
  return colors
    .filter(color => color.price == price)
    .map(color => color.color)[0];
}

// console.log(getTribuneNameBySectorName('1'));
// console.log(getSectorByName('1'));
// console.log(isTribuneAvailable('west'));
// console.log(isTribuneAvailable('south'));
//
// console.log(isSectorAvalable('4'));
// console.log(isSectorAvalable('3'));
// console.log(isSectorRowAvailable('1','1'));
// console.log(isSectorRowAvailable('1','3'));
// console.log(isSectorRowAvailable('3','3'));
console.log(getSectorPrice('11'));
console.log(isSectorRowAvailable('3', '1'));
// console.log(getColorByPrice(20));


var i = { action: 'pay',
  payment_id: 360022887,
  status: 'sandbox',
  version: 3,
  type: 'buy',
  paytype: 'card',
  public_key: 'i76561545952',
  acq_id: 414963,
  order_id: '2e7e3e50-0018-11e7-9ecb-b1e6765ec4ce',
  liqpay_order_id: '9ILIVWWG1488548980220966',
  description: ' Metalist vs Солли Плюс (sector #20, row #35, number #22) | ',
  sender_card_mask2: '545708*56',
  sender_card_bank: 'pb',
  sender_card_type: 'mc',
  sender_card_country: 804,
  ip: '82.117.234.33',
  amount: 10,
  currency: 'UAH',
  sender_commission: 0,
  receiver_commission: 0.28,
  agent_commission: 0,
  amount_debit: 10,
  amount_credit: 10,
  commission_debit: 0,
  commission_credit: 0.28,
  currency_debit: 'UAH',
  currency_credit: 'UAH',
  sender_bonus: 0,
  amount_bonus: 0,
  mpi_eci: '7',
  is_3ds: false,
  create_date: 1488548980257,
  end_date: 1488548980257,
  transaction_id: 360022887 }
