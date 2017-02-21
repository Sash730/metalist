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
          this.availability = this.currentAvailabilitySchema;
        }
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
      this.tribune = {};
      this.sector = {};
      this.price = {};
      this.availability = {};
      this.rows = [];
    }

    checkNotSellRowInSector() {
      let notSellRows = [];

      this.rows.forEach(row => {
        if (!row.availableStatus) {
          notSellRows.push(row);
        }
      });

      return notSellRows;
    }

    addTribuneInAvailabilitySchema(tribuneName, flag) {
      if (!flag) {
        this.availability['tribune_'+tribuneName] = {};
      }
      this.availability['tribune_'+tribuneName].name = this.tribune.name;
      this.availability['tribune_'+tribuneName].availableStatus = this.tribune.availableStatus;
    }

    addSectorInAvailabilitySchema(tribuneName, sectorNumber) {
      this.availability['tribune_'+tribuneName]['sector_'+sectorNumber] = {};
      this.availability['tribune_'+tribuneName]['sector_'+sectorNumber].name = this.sector.name;
      this.availability['tribune_'+tribuneName]['sector_'+sectorNumber].availableStatus = this.sector.availableStatus;
    }

    getPreparedAvailabilitySchema(tribuneName, sectorNumber) {
      let availability = this.availability,
          notSellRows = this.checkNotSellRowInSector(),
          flag = !!availability['tribune_'+tribuneName];

      if (!this.tribune.availableStatus) {//tr false
        this.addTribuneInAvailabilitySchema(tribuneName, flag);
      } else {//tr true
        if (!this.sector.availableStatus) {//sec false
          this.addTribuneInAvailabilitySchema(tribuneName, flag);
          this.addSectorInAvailabilitySchema(tribuneName, sectorNumber);
        } else {//sec true
          if(notSellRows.length) {
            this.addTribuneInAvailabilitySchema(tribuneName, flag);
            this.addSectorInAvailabilitySchema(tribuneName, sectorNumber);
            availability['tribune_'+tribuneName]['sector_'+sectorNumber].rows = notSellRows;
          } else {
            if (availability['tribune_'+tribuneName] ) {
              delete availability['tribune_'+tribuneName];
            }
          }
        }
      }
        //console.log('availability7777', availability);
      return availability;
    }

    getPreparedPriceSchema(tribuneName, sectorNumber) {
      let priceSchema = this.price,
          tribune = this.tribune,
          sector = this.sector;

      delete sector.rows;
      this.message = '';

      if(tribune.availableStatus) {
        if (!priceSchema['tribune_' + tribuneName]) {
          priceSchema['tribune_' + tribuneName] = {};
        }
        priceSchema['tribune_' + tribuneName].name = tribune.name;
        priceSchema['tribune_' + tribuneName].price = tribune.price;
      }
      if ( sector.price && sector.availableStatus) {
        priceSchema['tribune_'+tribuneName]['sector_'+sectorNumber] = sector;
      }

      return priceSchema;
    }

    onChange(form, tribuneName, sectorNumber) {
      form.$setDirty();
      form.schemaName.$setDirty();
      form.tribunePrice.$setDirty();
      form.sectorPrice.$setDirty();

      if(!tribuneName || ( !this.tribune.price && !this.sector.price )
        || ( !this.tribune.price && !this.sector.availableStatus)) {
        this.message = 'Выберите сектор  и укажите цену трибуны и/или сектора.';
        return;
      }

      if(form.$valid) {
        let availability = this.getPreparedAvailabilitySchema(tribuneName, sectorNumber),
          price = this.getPreparedPriceSchema(tribuneName, sectorNumber),
          priceSchema = {
                          price: price,
                          availability: availability
                        };

        this.onUpdatePrice({
                             $event: { priceSchema: priceSchema }
                            });
        this.tribune = {};
        this.sector = {};
        this.rows = [];
      }
    }

  }

angular.module('metalistTicketsApp.admin')
  .controller('PriceFormController', PriceFormController);
})();
