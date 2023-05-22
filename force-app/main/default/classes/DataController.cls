public with sharing class DataController {
    @AuraEnabled(cacheable= true)
    public static List<Product2> getProductList(){
        return [SELECT Id, Name FROM Product2];
    }
}