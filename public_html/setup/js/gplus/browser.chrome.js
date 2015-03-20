var Browser = function (lang) {
    this.CurrentLang = "de";
    this.Messages = null;
    this.LastMessage=null;

    if (lang !== undefined) {
        this.CurrentLang = lang;
    }
};


Browser.prototype = {
    constructor: Browser,
    LoadMessagesForSetup: function (ret) {
        var obj = this;

        $.getJSON("../../_locales/" + obj.CurrentLang + "/messages.json", function (keys) {
            obj.Messages = keys;
            if (ret!==undefined) {
                ret();
            }
        });
    },
    GetMessage: function (id) {
        return chrome.i18n.getMessage(id);
    },
    GetMessageFromSetup: function (id) {
        var obj = this;
        return obj.GetInnerMessageFromSetup(id);

    },
    GetInnerMessageFromSetup:function(id) {
        if (this.Messages !== null && this.Messages[id] !== undefined) {
            return this.Messages[id].message;
        }
    },
    GetExtensionFile:function(filename) {
        return chrome.extension.getURL(filename);
    }
};