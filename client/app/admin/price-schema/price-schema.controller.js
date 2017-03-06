'use strict';

(function () {

  class PriceSchemaController {

    constructor(PriceSchemaService) {
      this.priceSchemaService = PriceSchemaService;

      this.stadium = {};
      this.priceSchemas = [];
      this.availabilityRows = {};
      this.currentPriceSchema = {};
      this.currentTribune = {};
      this.currentSector = {};
      this.currentRows = [];
    }

    $onInit() {
      this.loadPriceSchemas();
      this.loadStadium();
    }

    loadPriceSchemas() {
      this.priceSchemaService.loadPrices()
        .then(response => this.priceSchemas = response.data );
    }

    loadStadium() {
      this.priceSchemaService.getStadium()
        .then( response => this.stadium = response.data );
    }

    setCurrentPriceSchema(schemaName) {
      this.currentTribune = {};
      this.currentSector = {};

      if (schemaName === '---New Schema---') {
        this.currentPriceSchema = {};
      } else {
        let currentPriceSchema = this.priceSchemas.filter(schema => schema.price.name === schemaName)[0];

        this.currentPriceSchema = currentPriceSchema.price;
        this.availabilityRows = currentPriceSchema.availabilityRows || {};
      }
    }

    getSectorFromStadium(tribuneName, sectorNumber) {
      this.currentSector = this.stadium['tribune_' + tribuneName]['sector_' + sectorNumber];
      this.currentSector.available = true;
    }

    getSectorForSetPrice($event) {
      let priceSchema = this.currentPriceSchema,
          tribuneName = $event.tribune,
          sectorNumber = $event.sector;

      if (!priceSchema['tribune_' + tribuneName]) {
        this.currentTribune = this.stadium['tribune_' + tribuneName];
        this.currentTribune.available = true;
        this.getSectorFromStadium(tribuneName, sectorNumber);
      } else {
        this.currentTribune = priceSchema['tribune_' + tribuneName];

        if (!priceSchema['tribune_' + tribuneName]['sector_' + sectorNumber]) {
          this.getSectorFromStadium(tribuneName, sectorNumber);
        } else {
          this.currentSector = priceSchema['tribune_' + tribuneName]['sector_' + sectorNumber];
        }
      }

      this.getRowsForSetAvailability(tribuneName, sectorNumber);
    }

    getRowsForSetAvailability(tribuneName, sectorNumber) {
      let currentAvailableRows = this.availabilityRows['sector_' + sectorNumber],
          stadiumRows = this.stadium['tribune_' + tribuneName]['sector_' + sectorNumber].rows;

      if (!currentAvailableRows) {
        this.addAvailableStatusPropsIntoRows(stadiumRows);
      } else {
        this.addAvailableStatusPropsIntoRows(stadiumRows);
        this.checkAvailableStatusIntoRows(currentAvailableRows.rows);
      }
    }

    addAvailableStatusPropsIntoRows(rows) {
      this.currentRows = rows.map(row => Object.assign({}, {name: row.name, available: true}));
    }

    checkAvailableStatusIntoRows(checkRows) {
      this.currentRows.forEach(row => {
        checkRows.forEach(checkRow => {
          if (checkRow.name === row.name) {
             row.available =  checkRow.available;
          }
        });
      });
    }

    savePriceSchema($event) {
       this.priceSchemaService.savePriceSchema($event.priceSchema)
        .then((priceSchema) => {
          this.currentPriceSchema = priceSchema.price;
          this.availabilityRows = priceSchema.availabilityRows;

          this.loadPriceSchemas();
          this.loadStadium();
          this.currentTribune = {};
          this.currentSector = {};
          this.currentRows = [];
        });
    }

  }

  angular.module('metalistTicketsApp.admin')
    .controller('PriceSchemaController', PriceSchemaController);
})();
