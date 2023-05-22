import { LightningElement, api } from 'lwc';

export default class Pagination extends LightningElement {
    currentPage = 1;
    totalRecords;
    recordList;
    recordSize = 10;
    totalPage = 0;
    get records(){
        return this.visibleRecords;
    }
    @api 
    set records(data){
        if(data){ 
            this.recordList = data;
            this.totalRecords = data;
            this.recordSize = Number(this.recordSize);
            this.totalPage = Math.ceil(data.length/this.recordSize);
            this.updateRecords();
        }
    }

    get disablePrevious(){ 
        return this.currentPage<=1;
    }
    get disableNext(){ 
        return this.currentPage>=this.totalPage;
    }
    previousHandler(){ 
        if(this.currentPage>1){
            this.currentPage = this.currentPage-1;
            this.updateRecords();
        }
    }
    nextHandler(){
        if(this.currentPage < this.totalPage){
            this.currentPage = this.currentPage+1;
            this.updateRecords();
        }
    }
    updateRecords(){ 
        const start = (this.currentPage-1)*this.recordSize;
        const end = this.recordSize*this.currentPage;
        this.visibleRecords = this.recordList.slice(start, end);
        this.dispatchEvent(new CustomEvent('update',{ 
            detail:{ 
                records:this.visibleRecords
            }
        }))
    }

    recordSizeOptions = [
        { label: '10', value: '10' },
        { label: '20', value: '20' },
        { label: '50', value: '50' },
        { label: 'All', value: 'All' }
    ]
    
    updateRecordSize(event){
        let recordSize = event.target.value;
        if(recordSize == 'All'){
            this.recordSize = this.recordList.length;
        }else{
            this.recordSize = parseInt(recordSize);
        }
        this.currentPage = 1;
        this.totalPage = Math.ceil(this.recordList.length/this.recordSize);
        this.updateRecords();
    }

    handleSearch(event){
        let searchValue = event.target.value;
        let filteredRecords = this.totalRecords.filter(function (obj) {
            let strContains = false;
            for (const field in obj) {
                if(obj[field] != null && typeof(obj[field]) == 'string'){
                    strContains = obj[field].includes(searchValue);
                }
            }
            return strContains;
        });
        //console.log('filteredRecords: ', JSON.parse(JSON.stringify(filteredRecords)), this.totalRecords);
        this.recordList = JSON.parse(JSON.stringify(filteredRecords));
        this.currentPage = 1;
        this.totalPage = Math.ceil(this.recordList.length/this.recordSize);
        this.updateRecords();
    }
}