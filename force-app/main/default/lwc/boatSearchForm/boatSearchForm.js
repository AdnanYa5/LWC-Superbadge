import {
    LightningElement,
    track,
    wire
} from 'lwc';
import getBoatTypes from '@salesforce/apex/BoatDataService.getBoatTypes';
export default class BoatSearchForm extends LightningElement {
    selectedBoatTypeId = '';

    // Private
    error = undefined;

    @track searchOptions;

    // Wire a custom Apex method
    @wire(getBoatTypes)
    boatTypes({
        error,
        data
    }) {
        if (data) {
            console.log('Data---' + JSON.stringify(data));
            this.searchOptions = data.map(type => {
                const allTypes = {
                    "label": type.Name,
                    "value": type.Id
                };
                //return {label: type.name, value: type.Id};
                return allTypes;
            });
            this.searchOptions.unshift({
                label: 'All Types',
                value: ''
            });
            console.log("searchOptions---" + JSON.stringify(this.searchOptions));
        } else if (error) {
            this.searchOptions = undefined;
            this.error = error;
        }
    }

    // Fires event that the search option has changed.
    // passes boatTypeId (value of this.selectedBoatTypeId) in the detail
    handleSearchOptionChange(event) {
        // Create the const searchEvent
        // searchEvent must be the new custom event search
        this.selectedBoatTypeId = event.detail.value;
        console.log('selectedBoatTypeId----'+this.selectedBoatTypeId);
        const searchEvent = new CustomEvent("search", {
            detail: {
                boatTypeId: this.selectedBoatTypeId
            }
        });
        this.dispatchEvent(searchEvent);
    }
}