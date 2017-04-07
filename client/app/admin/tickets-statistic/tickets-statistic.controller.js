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
      this.getDaysStatistics();
    }

    getEventsStatistics() {
      this.ticketsService.getEventsStatistics()
        .then(statistic => {
          this.eventsStatistics = this.createEventsStatisticModel(statistic);
        });
    }

    getDaysStatistics() {
      this.ticketsService.getDaysStatistics()
        .then(statistic => this.daysStatistics = this.createDaysStatisticModel(statistic));
    }

    createEventsStatisticModel(statistic) {
      let uniqueEventsDate = this.getUniqueDates(statistic);

      return uniqueEventsDate.map(date => {
        let itemsPrices = this.getItemPricesByDate(date, statistic),
            itemSectors  = this.getItemSectorsByDate(date, statistic);

        return  {
          date: date,
          headline: this.getHeadLineByDate(date, statistic),
          count: this.getItemPricesByDate(date, statistic).length,
          sum: this.getSumOfArray(itemsPrices),
          details: this.getDetailsSectorsByEvent(itemSectors)
        };
      });
    }

    createDaysStatisticModel(statistic) {
      let uniqueDates = this.getUniqueDates(statistic);

      return uniqueDates.map(date => {
        let itemPrices = this.getItemPricesByDate(date, statistic);

        return  {
          date: date,
          sum: this.getSumOfArray(itemPrices),
          count: this.getItemPricesByDate(date, statistic).length,
          details: this.getDetailsPricesByDate(itemPrices)
        };
      });
    }

    getHeadLineByDate(date, statistic) {
      return statistic.filter(item => item.date == date)[0].headline;
    }

    getUniqueDates(statistic) {
      let dates = statistic.map(item => item.date),
        uniqueDates = [ ...new Set(dates) ];

      return uniqueDates;
    }

    getUniqueItems(items) {
      return [ ...new Set(items) ];
    }

    getItemPricesByDate(date, statistic) {
      return statistic.filter(item => item.date == date)
        .map(item => item.amount);
    }

    getItemSectorsByDate(date, statistic) {
      return statistic.filter(item => item.date == date)
        .map(item => item.sector);
    }

    getSumOfArray(array) {
      return array.reduce((a, b) => a + b, 0);
    }

    getItemsByKey(key, items) {
      return items.filter(item => item == key);
    }

    getDetailsPricesByDate(itemPrices) {
      let uniquePrices = this.getUniqueItems(itemPrices);

      return uniquePrices.map(price => {
        return {
          price: price,
          count: this.getItemsByKey(price, itemPrices).length
        };
      });
    }

    getDetailsSectorsByEvent(itemSectors) {
      let uniqueSectors = this.getUniqueItems(itemSectors);

      return uniqueSectors.map(sector => {
        return {
          sector: sector,
          count: this.getItemsByKey(sector, itemSectors).length
        };
      });
    }
  }

  angular.module('metalistTicketsApp.admin')
    .controller('TicketsStatisticController', TicketsStatisticController);
})();
