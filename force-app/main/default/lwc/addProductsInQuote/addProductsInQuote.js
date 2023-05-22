import { LightningElement, api } from 'lwc';
import getProducts from '@salesforce/apex/QuoteLinesController.getProducts';

export default class AddProductsInQuote extends LightningElement {
    @api quoteName;
    productList = [];
    visibleProducts = [];
    handleSelect(event){
        this.dispatchEvent(new CustomEvent('select'));
    }
    connectedCallback(){
        this.getData('');
    }
    getData(productName){
        getProducts({productName: productName}).then(result =>{
            this.productList = result;
        }).catch(error =>{
            console.log(error);
        })
    }
    updateProductHandler(event){
        this.visibleProducts=[...event.detail.records];
    }
    refreshProducts(event){
        if(event.key == 'Enter'){
            this.getData(event.target.value);
        }
    }
    searchProducts(){
        let productName = this.template.querySelector('.product-name').value;
        this.getData(productName);
    }

    configProduct(event){
        let productId = event.target.getAttribute('data-id');
        if(productId){
            this.dispatchEvent(new CustomEvent('select',{
                detail:{productId: productId}
            }));
        }
    }
}