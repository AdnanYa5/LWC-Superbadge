import {
  LightningElement,
  track,
  wire,
  api
} from "lwc";
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";
import {
  MessageContext,
  publish,
  subscribe,
  unsubscribe,
  APPLICATION_SCOPE
} from "lightning/messageService";
import {
  CurrentPageReference
} from 'lightning/navigation';
import {
  getRecord
} from 'lightning/uiRecordApi';
//import LONGITUDE_FIELD from '@salesforce/schema/Boat__c.Geolocation__Longitude__s';
//import LATITUDE_FIELD from '@salesforce/schema/Boat__c.Geolocation__Latitude__s';

const LONGITUDE_FIELD = 'Boat__c.Geolocation__Longitude__s';
const LATITUDE_FIELD = 'Boat__c.Geolocation__Latitude__s';

const BOAT_FIELDS = [
  LATITUDE_FIELD,
  LONGITUDE_FIELD
];
export default class BoatMap extends LightningElement {
  // private
  subscription = null;
  @api boatId;

  @wire(CurrentPageReference) pageRef;

  // Getter and Setter to allow for logic to run on recordId change
  // this getter must be public
  @api get recordId() {
    return this.boatId;
  }
  set recordId(value) {
    this.setAttribute('boatId', value);
    this.boatId = value;
  }

  error = undefined;
  @track mapMarkers = [];

  // Initialize messageContext for Message Service
  @wire(MessageContext) messageContext;


  // Getting record's location to construct map markers using recordId
  // Wire the getRecord method using ('$boatId')
  @wire(getRecord, {
    recordId: '$boatId',
    fields: BOAT_FIELDS
  })
  wiredRecord({
    error,
    data
  }) {
    // Error handling
    if (data) {
      this.error = undefined;
      const longitude = data.fields.Geolocation__Longitude__s.value;
      const latitude = data.fields.Geolocation__Latitude__s.value;
      this.updateMap(longitude, latitude);
    } else if (error) {
      this.error = error;
      this.boatId = undefined;
      this.mapMarkers = [];
    }
  }

  // Runs when component is connected, subscribes to BoatMC
  connectedCallback() {
    // recordId is populated on Record Pages, and this component
    // should not update when this component is on a record page.
    if (this.subscription || this.recordId) {
      return;
    }

    this.subscribeMC();
  }

  // Creates the map markers array with the current boat's location for the map.
  updateMap(Longitude, Latitude) {
    this.mapMarkers = [{
      location: {
        Latitude: Latitude,
        Longitude: Longitude
      }
    }];
  }

  // Getter method for displaying the map component, or a helper method.
  get showMap() {
    return this.mapMarkers.length > 0;
  }

  subscribeMC() {
    this.subscription = subscribe(this.messageContext, BOATMC, (message) => {
      this.boatId = message.recordId;
    }, {
      scope: APPLICATION_SCOPE
    });
  }
}