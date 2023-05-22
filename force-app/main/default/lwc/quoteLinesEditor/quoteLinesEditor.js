import { LightningElement, api, wire, track } from 'lwc';
import getQuoteLines from '@salesforce/apex/QuoteLinesController.getQuoteLines';
import addProducts from '@salesforce/apex/QuoteLinesController.addProducts';
import { getRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QuoteLinesEditor extends LightningElement {
    @api quoteId;
    quoteLines = [];
    @track dataWrapper = [];
    quoteName;

    showAppProductPage = false;

    @wire( getRecord, { recordId: '$quoteId', fields: ['Quote__c.Name']})
    getQuoteName({data, error}){
        if(data){
            this.quoteName = data.fields.Name.value;
        }else if(error){
            console.log(error);
        }
    }

    connectedCallback(){
        this.getData();
    }

    getData(){
        getQuoteLines({quoteId: this.quoteId})
            .then(result=>{
                console.log('Response ', JSON.parse(JSON.stringify(result)));
                this.quoteLines = result;
                this.dataWrapper = [];
                for(let i=0; i<this.quoteLines.length; i++){
                    if(this.quoteLines[i].ProductType__c != 'Component'){
                        let quoteLine = this.quoteLines[i];
                        quoteLine.isMain = true;
                        quoteLine.level = 0;
                        quoteLine.leftSpace = '';
                        if(this.isChildPresent(this.quoteLines[i].ProductId__c)){
                            quoteLine.iconName='utility:right';
                        }
                        this.dataWrapper.push(quoteLine);
                    }
                }
                console.log('Result: ', result);
            }).catch(error =>{
                console.log(error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error saving records',
                        message: error.body.message,
                        variant: 'error',
                    }),
                );
            })
    }

    isChildPresent(prodId){
        let isPresent = false;
        this.quoteLines.forEach(lineItem=>{
            if(lineItem.ComponentId__r != null && lineItem.ComponentId__r.ParentProduct__c == prodId){
                isPresent = true;
            }
        })
        return isPresent;
    }

    handleProductOptions(event){
        let quoteLineId = event.target.getAttribute('data-id');
        for(let i=0; i<this.dataWrapper.length; i++){
            if(this.dataWrapper[i].Id == quoteLineId){
                if(this.dataWrapper[i].iconName == 'utility:right'){
                    this.dataWrapper[i].iconName = 'utility:down';
                    for(let j=0; j<this.quoteLines.length; j++){
                        if(this.quoteLines[j].ComponentId__r != null && this.quoteLines[j].ComponentId__r.ParentProduct__c == this.dataWrapper[i].ProductId__c){
                            let quoteLine = JSON.parse(JSON.stringify(this.quoteLines[j]));
                            if(this.isChildPresent(quoteLine.ProductId__c)){
                                quoteLine.iconName='utility:right';
                            }
                            if(this.dataWrapper[i].level !== null){
                                quoteLine.level = this.dataWrapper[i].level + 1;
                                quoteLine.leftSpace = this.getSpace(quoteLine.level);
                            }
                            this.dataWrapper.splice(i+1, 0, quoteLine);
                        }
                        //console.log('this.quoteLines[j]: ', this.quoteLines[j].ComponentId__r, this.dataWrapper[i].Id);
                    }
                }else{
                    this.dataWrapper[i].iconName = 'utility:right';
                    for(let j=i+1; j<this.dataWrapper.length; ){
                        if(this.dataWrapper[j].ComponentId__r != null && this.dataWrapper[j].ComponentId__r.ParentProduct__c == this.dataWrapper[i].ProductId__c){
                            let prodName = this.dataWrapper[j].ProductId__c;
                            this.dataWrapper.splice(j, 1);
                            this.removeChildItem(prodName);
                        }else{
                            j++
                        }
                    }
                }
            }
        }
        //console.log('this.dataWrapper: ', JSON.parse(JSON.stringify(this.dataWrapper)));
    }
    removeChildItem(prodId){
        for(let i=0; i<this.dataWrapper.length; ){
            if( this.dataWrapper[i].ComponentId__r && prodId == this.dataWrapper[i].ComponentId__r.ParentProduct__c){
                this.removeChildItem(this.dataWrapper[i].ProductId__c);
                this.dataWrapper.splice(i, 1);
            }else i++;
        }
    }
    getSpace(n){
        let space = '';
        for(let i=0; i<n; i++){
            space = space + 'tab ';
        }
        return space;
    }

    handleDeleteProduct(event){
        
    }

    handleShowAddProducts(){
        this.showAppProductPage = true;
    }

    handleAddProducts(event){
        this.showAppProductPage = false;
        if(event.detail && event.detail.productId){
            let productId = event.detail.productId;
            addProducts({productId: productId, quoteId: this.quoteId}).then(result =>{
                this.getData();
            }).catch(error =>{
                console.log(error);
            })
        }
    }
}