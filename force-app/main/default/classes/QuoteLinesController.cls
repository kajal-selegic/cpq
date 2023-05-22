public class QuoteLinesController {
    @AuraEnabled
    public static List<QuoteLine__c> getQuoteLines(Id quoteId){
        List<QuoteLine__c> quoteLines = [
            SELECT Id
            , ProductId__r.Name
            , ProductType__c
            , ComponentId__r.ParentProduct__c
            , ComponentId__r.ChildProduct__c
            FROM QuoteLine__c
            WHERE QuoteId__c = :quoteId
        ];
        return quoteLines;
    }
        
    @AuraEnabled
    public static List<QuoteLine__c> addProducts(Id productId, Id quoteId){
        List<Component__c> componentList = [
            SELECT Id
            , ParentProduct__c
            , ChildProduct__c
            FROM Component__c
        ];
        
        Map<Id,List<Component__c>> componentMap = new Map<Id,List<Component__c>>();
        for(Component__c component: componentList){
            List<Component__c> childComp = new List<Component__c>();
            if(componentMap.get(component.ParentProduct__c) != null){
                childComp = componentMap.get(component.ParentProduct__c);
            }
            childComp.add(component);
            componentMap.put(component.ParentProduct__c, childComp);
        }
        
        List<QuoteLine__c> quoteLines = new List<QuoteLine__c>();
        QuoteLine__c quoteLine = new QuoteLine__c();
        quoteLine.QuoteId__c = quoteId;
        quoteLine.ProductId__c = productId;
        quoteLine.ProductType__c = 'Product';
        quoteLines.add(quoteLine);
        
        quoteLines = createQuoteLines(productId, quoteId, componentMap, quoteLines);
        
        insert quoteLines;
        return quoteLines;
    }
    
    public static List<QuoteLine__c> createQuoteLines(Id productId, Id quoteId, Map<Id,List<Component__c>> componentMap, List<QuoteLine__c> quoteLines){
        if(componentMap.get(productId) != null && componentMap.get(productId).size() > 0){
            for(Component__c childComp: componentMap.get(productId)){
                QuoteLine__c quoteLine = new QuoteLine__c();
        		quoteLine.QuoteId__c = quoteId;
                quoteLine.ProductId__c = childComp.ChildProduct__c;
                quoteLine.ProductType__c = 'Component';
                quoteLine.ComponentId__c = childComp.Id;
                quoteLines.add(quoteLine);
                quoteLines = createQuoteLines(childComp.ChildProduct__c, quoteId, componentMap, quoteLines);
            }
        }
        return quoteLines;
    }
    
    @AuraEnabled
    public static List<Product2> getProducts(String productName){
        productName = '%'+ productName + '%';
        List<Product2> products = [
            SELECT Id
            , Name
            , ProductCode
            , Description
            FROM Product2
            WHERE Name LIKE :productName
        ];
        return products;
    }
}