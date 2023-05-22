import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class QuoteConfigure extends NavigationMixin(LightningElement) {
    @api recordId;
    handleNavigate(){
        var compDefinition = {
            componentDef: "c:quoteLinesEditor",
            attributes: {
                quoteId: this.recordId
            }
        };
        
        var encodedCompDef = btoa(JSON.stringify(compDefinition));
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/one/one.app#' + encodedCompDef
            }
        });
    }
}