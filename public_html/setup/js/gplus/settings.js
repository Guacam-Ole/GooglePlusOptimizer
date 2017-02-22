var gpoSettings = function () {
    this.Values;
    this.AllSettings = [];
    this.ReadCount = 0;
};

gpoSettings.prototype = {
    constructor: gpoSettings,
    Init: function () {
        var obj = this;
        // Alle Optionen hinzufügen
        obj.AllSettings.push(new gpoSetting("stoppwatch"));
        obj.AllSettings.push(new gpoSetting("plus1"));
        obj.AllSettings.push(new gpoSetting("yt"));
        obj.AllSettings.push(new gpoSetting("wham"));
        obj.AllSettings.push(new gpoSetting("hashtag"));
        obj.AllSettings.push(new gpoSetting("custom"));
        obj.AllSettings.push(new gpoSetting("community"));
        obj.AllSettings.push(new gpoSetting("birthday"));
        obj.AllSettings.push(new gpoSetting("known"));
        obj.AllSettings.push(new gpoSetting("trending"));
        obj.AllSettings.push(new gpoSetting("featcol"));
        obj.AllSettings.push(new gpoSetting("hashTags"));
        obj.AllSettings.push(new gpoSetting("fulltext"));
        obj.AllSettings.push(new gpoSetting("WHAMWhamText"));
        obj.AllSettings.push(new gpoSetting("WHAMWhamUrl"));
        obj.AllSettings.push(new gpoSetting("WHAMChristmasText"));
        obj.AllSettings.push(new gpoSetting("WHAMChristmasUrl"));
        obj.AllSettings.push(new gpoSetting("colorUsers"));
        obj.AllSettings.push(new gpoSetting("displayTrophy"));
        obj.AllSettings.push(new gpoSetting("displayLang"));
        obj.AllSettings.push(new gpoSetting("showEmoticons"));
        obj.AllSettings.push(new gpoSetting("lastWizard",undefined,true));
        obj.AllSettings.push(new gpoSetting("useBookmarks"));
        obj.AllSettings.push(new gpoSetting("useAutoSave"));
        obj.AllSettings.push(new gpoSetting("markLSR"));
        obj.AllSettings.push(new gpoSetting("markLSRBack"));
        obj.AllSettings.push(new gpoSetting("markLSRFront"));
        obj.AllSettings.push(new gpoSetting("markLSRText"));
        obj.AllSettings.push(new gpoSetting("markAdblock"));
        obj.AllSettings.push(new gpoSetting("markAdblockBack"));
        obj.AllSettings.push(new gpoSetting("markAdblockFront"));
        obj.AllSettings.push(new gpoSetting("markAdblockText"));
        obj.AllSettings.push(new gpoSetting("markCustom"));
        obj.AllSettings.push(new gpoSetting("markCustomBack"));
        obj.AllSettings.push(new gpoSetting("markCustomFront"));
        obj.AllSettings.push(new gpoSetting("markCustomText"));
        obj.AllSettings.push(new gpoSetting("CollectTicks"));
        obj.AllSettings.push(new gpoSetting("WizardMode", 1));
        obj.AllSettings.push(new gpoSetting("interval", 500));
        obj.AllSettings.push(new gpoSetting("UserCols"));
        obj.AllSettings.push(new gpoSetting("postillon"));
        obj.AllSettings.push(new gpoSetting("customUrl"));
    },
    Load: function (ret) {
        var obj = this;

        // Alle Optionen lesen
        $.each(obj.AllSettings, function (index, value) {
            value.Get(function () {
                obj.ReadCount++;
                if (obj.ReadCount === obj.AllSettings.length) {
                    obj.Convert(ret);
                }
            });
        });
    },
    Convert: function (ret) {
        var obj = this;
        var json = "";
        $.each(obj.AllSettings, function (index, value) {
            var strValue = value.Value;
            if (strValue === "undefined") {
                strValue = null;
            }
            var putBrackets = true;
            if (strValue === null || strValue === undefined || !isNaN(strValue) || strValue === "true" || strValue === "false") {
                if (strValue!=="") {
                    // Kein String
                    putBrackets = false;
                }
            } else if (strValue.indexOf("[") === 0 || strValue.indexOf("{") === 0) {
                // JSON-Objekt
                putBrackets = false;
            }
            if (value.DontParse || putBrackets) {
                strValue = "\"" + strValue + "\"";
            }


            var strName = value.Name.substring(0, 1).toUpperCase() + value.Name.substring(1);
            json += "\"" + strName + "\":" + strValue + ",";
        });
        json = json.substr(0, json.length - 1);
        obj.Values = $.parseJSON("{" + json + "}");

        ret();
    },
    Get: function (key) {
        var obj = this;
        var foundSetting = $.grep(obj.AllSettings, function (e) {
            return e.Name === key;
        });
        return foundSetting[0].Value;
    }
};

var gpoSetting = function (settingname, defaultValue, dontParse) {
    this.Name = settingname;
    this.Value;
    this.DefaultValue = defaultValue;
    this.DontParse=dontParse===true;
};

gpoSetting.prototype = {
    costructor: gpoSetting,
    Get: function (ret) {
        var obj = this;
        chrome.runtime.sendMessage({
            Action: "GetSetting",
            Name: obj.Name
        }, function (response) {
            if (response) {
                obj.Value = response.Result;
            } else {
                obj.Value=undefined;
            }
            if (obj.DefaultValue !== undefined && (obj.Value === undefined || obj.Value === null)) {
                obj.Value = obj.DefaultValue;
            }
            ret();
        });
    }
}
