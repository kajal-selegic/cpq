public class QuoteLineTriggerHandler {
    public static void DeleteChildQuoteLines(List<QuoteLine__c> quoteLines){
        List<String> quoteLineIds = new List<String>();
        for(QuoteLine__c quoteLine : quoteLines){
            quoteLineIds.add(quoteLine.Id);
        }
        List<QuoteLine__c> quoteLineList = [
            SELECT Id
            , ComponentId__r.ChildProduct__c
            FROM QuoteLine__c
            WHERE ComponentId__r.ChildProduct__c IN :quoteLineIds
        ];
        try {
        	delete quoteLineList;
        } catch (Exception e) {
            System.debug('QuoteLineTriggerHandler Error: '+ e);
        }
    }
}