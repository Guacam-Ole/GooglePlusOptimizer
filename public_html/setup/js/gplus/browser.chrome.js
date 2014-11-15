

var Browser= function (lang) {
    this.CurrentLang = "de";
    this.Messages=null;
    
    if (lang!==undefined) {
        this.CurrentLang=lang;
    }
};


Browser.prototype = {
    constructor: Browser,
    LoadMessagesForSetup:function() {
        var obj=this;
        $.getJSON("../../_locales/"+obj.CurrentLang+"/messages.json",function(keys) {
            obj.Messages=keys;
        });  
    },
    GetMessage:function(id) {
        return chrome.i18n.getMessage(id);
    },
    GetMessageFromSetup:function(id) {
       var obj=this;
       if (obj.Messages!==null && obj.Messages[id]!==undefined) {
           return obj.Messages[id].message;
       }
    }
};