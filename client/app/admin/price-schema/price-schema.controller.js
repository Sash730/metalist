'use strict';

(function () {

  class PriceSchemaController {

    constructor(PriceSchemaService) {
      this.priceSchemaService = PriceSchemaService;

      this.stadium = {};
      this.priceSchemas = [];
      this.currentPriceSchema = {};
      this.currentAvailabilitySchema = {};
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
        .then( response => this.priceSchemas = response.data );
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
        this.currentAvailabilitySchema = {};
      } else {
        let currentPriceSchema = this.priceSchemas.filter(schema => schema.price.name === schemaName)[0];
        console.log('currentPriceSchema',currentPriceSchema);
        this.currentPriceSchema = currentPriceSchema.price;
        this.currentAvailabilitySchema = currentPriceSchema.availability || {};
      }
    }

    getSectorForSetPrice($event) {
      let priceSchema = this.currentPriceSchema,
        tribuneName = $event.tribune,
        sectorNumber = $event.sector;

      if (!priceSchema['tribune_' + tribuneName]) {
        this.currentTribune = this.stadium['tribune_' + tribuneName];
        this.currentSector = this.stadium['tribune_' + tribuneName]['sector_' + sectorNumber];
      } else {
        this.currentTribune = priceSchema['tribune_' + tribuneName];

        if (!priceSchema['tribune_' + tribuneName]['sector_' + sectorNumber]) {
          this.currentSector = this.stadium['tribune_' + tribuneName]['sector_' + sectorNumber];
        } else {
          this.currentSector = priceSchema['tribune_' + tribuneName]['sector_' + sectorNumber];
        }
      }

      this.getAvailabilityStatus(tribuneName, sectorNumber);
    }

    getAvailabilityStatus(tribuneName, sectorNumber) {
      let availability  = this.currentAvailabilitySchema,
          stadiumRows = this.stadium['tribune_' + tribuneName]['sector_' + sectorNumber].rows;
      this.currentRows = this.addAvailableStatusPropsIntoRows(stadiumRows);

      if(!availability['tribune_' + tribuneName]) {
        this.currentTribune.availableStatus = true;
        this.currentSector.availableStatus = true;
      } else {

        if(!availability['tribune_' + tribuneName].availableStatus) {//tribune status = false
          this.currentTribune.availableStatus = false;
          this.currentSector.availableStatus = false;
        } else {//tribune status = true

          if(availability['tribune_' + tribuneName]['sector_' + sectorNumber]) {

            if (!availability['tribune_' + tribuneName]['sector_' + sectorNumber].availableStatus) {//sector status = false
              this.currentTribune.availableStatus = true;
              this.currentSector.availableStatus = false;
            } else {//sector status = true
              this.currentTribune.availableStatus = true;
              this.currentSector.availableStatus = true;
              this.checkAvailableStatusIntoRows(availability['tribune_' + tribuneName]['sector_' + sectorNumber].rows);
            }
          } else {
            this.currentTribune.availableStatus = true;
            this.currentSector.availableStatus = true;
          }
        }
      }
    }

    addAvailableStatusPropsIntoRows(rows) {
      return rows.map(row => Object.assign({}, row, {availableStatus: true}));
    }

    checkAvailableStatusIntoRows(checkRows) {
      this.currentRows.forEach(row => {
        checkRows.forEach(checkRow => {
          if (row.name == checkRow.name) {
            row.availableStatus = checkRow.availableStatus;
          }
          })
      });
    }

    savePriceSchema($event) {
       this.priceSchemaService.savePriceSchema($event.priceSchema)
          .then(response => {
            this.currentPriceSchema = response.data.price;
            this.currentAvailabilitySchema = response.data.availability || {};

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
