'use strict';

(function () {

  class PriceFormController {

    constructor() {
      this.price = {};
      this.availability = {};
      this.tribune = {};
      this.sector = {};
      this.rows = [];
      this.message = '';
      this.toggleRows = true;
    }

    $onInit() {
      this.initComponent();
    }

    $onChanges(changes) {
      if (changes.currentPriceSchema) {
        if (!this.currentPriceSchema.name) {
          this.initComponent();
        }
        if (this.currentPriceSchema.name) {
          this.price = this.currentPriceSchema;
        }
      }
      if ( changes.availabilityRows ) {
        this.availability = this.availabilityRows;
      }
      if ( changes.currentTribune ) {
        this.tribune = this.currentTribune;
      }
      if ( changes.currentSector ) {
        this.sector = this.currentSector;
      }
      if ( changes.currentRows ) {
        this.rows = this.currentRows;
      }
    }

    initComponent() {
      this.price = {};
      this.availability = {};
      this.tribune = {};
      this.sector = {};
      this.rows = [];
    }

    setAvailableRowsInSector() {
      let sellRows = [];

      this.rows.forEach(row => {
        if (!row.available) {
          sellRows.push(row);
        }
      });

      return sellRows;
    }

    setAvailabilityRows(sectorNumber) {
      let sector = this.sector,
          availability = this.availability,
          sellRows = this.setAvailableRowsInSector();

        if ( sector.available && sellRows.length ) {
            availability['sector_'+sectorNumber] = Object.assign({}, {name: sectorNumber, rows: sellRows});
        } else {
          if(availability['sector_'+sectorNumber]) {
            delete availability['sector_'+sectorNumber];
          }
        }

      return availability;
    }

    setPriceSchema(tribuneName, sectorNumber) {
      let priceSchema = this.price,
          tribune = this.tribune,
          sector = this.sector;

      delete sector.rows;
      this.message = '';

      if(tribune.available) {
        if (!priceSchema['tribune_' + tribuneName]) {
          priceSchema['tribune_' + tribuneName] = Object.assign({}, {name: tribune.name});
        }
        priceSchema['tribune_' + tribuneName].available = tribune.available;
        priceSchema['tribune_' + tribuneName].price = tribune.price;
      }
      if ( (sector.available && sector.price) || !sector.available ) {
        priceSchema['tribune_'+tribuneName]['sector_'+sectorNumber] = sector;
      } else {
        if (priceSchema['tribune_'+tribuneName]['sector_'+sectorNumber]) {
          delete priceSchema['tribune_'+tribuneName]['sector_'+sectorNumber];
        }
      }

      return priceSchema;
    }

    onChange(form, tribuneName, sectorNumber) {
      form.$setDirty();
      form.schemaName.$setDirty();
      form.tribunePrice.$setDirty();
      form.sectorPrice.$setDirty();

      if(!tribuneName || ( !this.tribune.price && !this.sector.price )
        || ( !this.tribune.price && !this.sector.available)) {
        this.message = 'Выберите сектор  и укажите цену трибуны и/или сектора.';
        return;
      }

      if(form.$valid) {
        let priceSchema = {
                           price: this.setPriceSchema(tribuneName, sectorNumber),
                           availabilityRows: this.setAvailabilityRows(sectorNumber)
                          };

        this.onUpdatePrice({ $event: { priceSchema: priceSchema } });
      }
    }

  }

angular.module('metalistTicketsApp.admin')
  .controller('PriceFormController', PriceFormController);
})();
