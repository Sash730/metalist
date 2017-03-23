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
        .then(statistic => this.daysStatistics = this.makeStatisticsForDays(statistic) );
    }

    makeStatisticsForDays(statistic) {
      let obj = statistic.reduce((acc, stat) => {
        let p = stat.date;
        if (!acc[0].hasOwnProperty(p)) acc[0][p] = [];
        acc[0][p].push(stat.amount);
        return acc;
      },[{}])
        .reduce((acc, v) => {
          Object.keys(v).forEach(function(k){acc.push({day:k, amount:v[k]})});
          return acc;
        },[]);
      let obj1 = obj.map(day => {
        let amount = this.getUnicAmountCount(day.amount),
          total = this.getTotal(amount);
        return {
          date: day.day,
          amount: amount,
          total: total
        }
      });
      console.log('obj', obj1);
      return obj1;
    }

    getUnicAmountCount(amount) {
      let responses = [];
      amount.forEach((am) => {
        if (!responses.filter(resp => resp.amount === am).length) {
          responses.push({amount: am , count: 1});
        } else {
          responses.forEach(resp => {
            if(resp.amount === am) resp.count++;
          })
        }

      });
      console.log('responses', responses);
      return responses;
    }

    getTotal(amount) {
      let total = 0;
      console.log('am', amount);
      amount.forEach((am) => {
        return total += am.amount * am.count;
      });
      return total;
    }

  }

  angular.module('metalistTicketsApp.admin')
    .controller('TicketsStatisticController', TicketsStatisticController);
})();
