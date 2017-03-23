'use strict';

(function () {

  class TicketsStatisticController {
    constructor(TicketsService) {
      this.ticketsService = TicketsService;

      this.eventsStatistics = [];
      this.daysStatistics = [];
    }

    $onInit() {
      this.getEventsStatistics();
      this.getDaysStatistics()
    }

    getEventsStatistics() {
      this.ticketsService.getEventsStatistics()
        .then(statistic => {
          this.eventsStatistics = statistic;
        });
    }

    getDaysStatistics() {
      this.ticketsService.getDaysStatistics()
        .then(statistic => this.daysStatistics = this.createStatisticModel(statistic));
    }

    createStatisticModel(statistic) {
      let uniqueDates = this.getUniqueDates(statistic);
      return uniqueDates.map(date => {
        let itemPrices = this.getItemPricesByDate(date, statistic);
        return  {
          date: date,
          sum: this.getSumOfArray(itemPrices),
          count: this.getItemPricesByDate(date, statistic).length,
          details: this.getDetailsPricesByDate(itemPrices)
        }
      });
    }


    getUniqueDates (statistic) {
      let dates = statistic.map(item => item.date);
      return [ ...new Set(dates) ]
    }

    getUniquePrices (itemPrices) {
      return [ ...new Set(itemPrices) ];
    }

    getItemPricesByDate (date, statistic) {
      return statistic.filter(item => item.date == date)
        .map(item => item.amount)
    }

    getSumOfArray(array) {
      return array.reduce((a, b) => a + b, 0);
    }

    getItemsByPrice(price, prices) {
      return prices.filter(item => item == price);
    }

    getDetailsPricesByDate(itemPrices) {
      let uniquePrices = this.getUniquePrices(itemPrices);
      return uniquePrices.map(price => {
        return {
          price: price,
          count: this.getItemsByPrice(price, itemPrices).length
        }
      })
    }
  }

  angular.module('metalistTicketsApp.admin')
    .controller('TicketsStatisticController', TicketsStatisticController);
})();
