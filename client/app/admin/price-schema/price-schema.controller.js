'use strict';

(function () {

  class PriceSchemaController {

    constructor(PriceSchemaService, Stadium) {
      this.stadium = Stadium;
      this.priceSchemaService = PriceSchemaService;

      this.priceSchemas = [];
      this.currentPriceSchema = {};
      this.currentTribune = {};
      this.currentSector = {};
      this.message = '';
      this.toggleRows = true;
    }

    $onInit() {
      this.loadPriceSchemas();
    }

    loadPriceSchemas() {
      this.priceSchemaService.loadPrices()
        .then(response => {
          this.priceSchemas = response.data;
        });
    }

    setCurrentPriceSchema(schemaName) {
      this.currentTribune = {};
      this.currentSector = {};

      if (schemaName === '---New Schema---') {
        this.currentPriceSchema = {};
      } else {
        let currentPriceSchema = this.priceSchemas.filter(schema => schema.priceSchema.name === schemaName)[0];
        this.currentPriceSchema = currentPriceSchema.priceSchema;
      }
    }

    getSectorForSetPrice(tribuneName, sectorNumber) {
      let priceSchema = this.currentPriceSchema;
      this.message = '';

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

      this.currentSector.rows.forEach(row => {
        if (!'beInSell' in row) {
          row.beInSell = true;
        }
      });
    }

    getSectorsFill(tribuneName, sectorNumber) {
      let defaultColor = '#808080',
          priceSchema = this.currentPriceSchema,
          price = this.priceSchemaService.getPriceBySector(tribuneName, sectorNumber, priceSchema);

      if (!price) {
        return defaultColor;
      } else {
        return this.priceSchemaService.getColorByPrice(price);
      }
    }

    getPreparedPriceSchema(tribuneName, sectorNumber) {
      let priceSchema = this.currentPriceSchema,
          tribune = this.currentTribune,
          sector = this.currentSector;

      if (priceSchema['tribune_'+tribuneName] && priceSchema['tribune_'+tribuneName]['sector_'+sectorNumber]) {

        return priceSchema;
      }

      if (priceSchema['tribune_'+tribuneName] && !priceSchema['tribune_'+tribuneName]['sector_'+sectorNumber]) {

        priceSchema['tribune_'+tribuneName]['sector_'+sectorNumber] = sector;
        return priceSchema;
      }

      if (!priceSchema['tribune_'+tribuneName]) {
        priceSchema['tribune_'+tribuneName] = {};
        priceSchema['tribune_'+tribuneName].name = tribune.name;
        priceSchema['tribune_'+tribuneName].price = tribune.price;
        priceSchema['tribune_'+tribuneName]['sector_'+sectorNumber] = sector;

        return priceSchema;
      }
    }

    savePriceSchema(form, tribuneName, sectorNumber) {
      form.$setDirty();
      form.schemaName.$setDirty();
      form.tribunePrice.$setDirty();
      form.sectorPrice.$setDirty();

      if(!tribuneName) {
        this.message = 'Выберите сектор.';
        return;
      }

      if(form.$valid) {
        let priceSchema = this.getPreparedPriceSchema(tribuneName, sectorNumber);

        this.priceSchemaService.savePriceSchema(priceSchema)
          .then(response => {
            this.currentPriceSchema = response.data.priceSchema;
            this.currentTribune = {};
            this.currentSector = {};
            this.loadPriceSchemas();
          });
      }
    }

  }

  angular.module('metalistTicketsApp.admin')
    .controller('PriceSchemaController', PriceSchemaController);
})();
