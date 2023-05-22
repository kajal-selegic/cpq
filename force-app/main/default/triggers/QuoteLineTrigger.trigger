trigger QuoteLineTrigger on QuoteLine__c (before delete) {
    if (Trigger.isDelete && Trigger.isbefore) {
        QuoteLineTriggerHandler.DeleteChildQuoteLines(Trigger.old);
    }
}