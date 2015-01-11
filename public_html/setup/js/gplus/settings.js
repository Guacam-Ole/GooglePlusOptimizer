
var gpoSettings=function() 
{
    this.Values;
    this.AllSettings=[];
    this.ReadCount=0;    
};

gpoSettings.prototype = {
    constructor: gpoSettings,
    Init: function () {  
        var obj=this;
        // Alle Optionen hinzufügen
        obj.AllSettings.push(new gpoSetting("stoppwatch"));
        obj.AllSettings.push(new gpoSetting("Schniedel"));
        obj.AllSettings.push(new gpoSetting("Wutz"));
        obj.AllSettings.push(new gpoSetting("plus1"));
        obj.AllSettings.push(new gpoSetting("yt"));
        obj.AllSettings.push(new gpoSetting("wham"));
        obj.AllSettings.push(new gpoSetting("hashtag"));
        obj.AllSettings.push(new gpoSetting("custom"));
        obj.AllSettings.push(new gpoSetting("community"));
        obj.AllSettings.push(new gpoSetting("birthday"));
        obj.AllSettings.push(new gpoSetting("known"));
        obj.AllSettings.push(new gpoSetting("hashTags"));
        obj.AllSettings.push(new gpoSetting("fulltext"));
        obj.AllSettings.push(new gpoSetting("WHAMWhamText"));
        obj.AllSettings.push(new gpoSetting("WHAMWhamUrl"));
        obj.AllSettings.push(new gpoSetting("WHAMChristmasText"));
        obj.AllSettings.push(new gpoSetting("WHAMChristmasUrl"));
        obj.AllSettings.push(new gpoSetting("Weather"));
        obj.AllSettings.push(new gpoSetting("colorUsers"));
        obj.AllSettings.push(new gpoSetting("filterImages"));
        obj.AllSettings.push(new gpoSetting("filterVideo"));
        obj.AllSettings.push(new gpoSetting("filterLinks"));
        obj.AllSettings.push(new gpoSetting("filterGifOnly"));
        obj.AllSettings.push(new gpoSetting("filterMp4Only"));
        obj.AllSettings.push(new gpoSetting("filterSharedCircles"));
        obj.AllSettings.push(new gpoSetting("displayTrophy"));
        obj.AllSettings.push(new gpoSetting("displayLang"));
        obj.AllSettings.push(new gpoSetting("showEmoticons"));
        obj.AllSettings.push(new gpoSetting("lastWizard"));
        obj.AllSettings.push(new gpoSetting("useBookmarks"));
        obj.AllSettings.push(new gpoSetting("useAutoSave"));
        obj.AllSettings.push(new gpoSetting("markLSRPosts"));
        obj.AllSettings.push(new gpoSetting("CollectTicks"));
        obj.AllSettings.push(new gpoSetting("displayQuickHashes"));
        obj.AllSettings.push(new gpoSetting("WizardMode",1));
        obj.AllSettings.push(new gpoSetting("interval",500));
        obj.AllSettings.push(new gpoSetting("sportEnabled"));
        obj.AllSettings.push(new gpoSetting("weatherEnabled"));
        obj.AllSettings.push(new gpoSetting("Sport"));
        obj.AllSettings.push(new gpoSetting("QuickShares"));
        obj.AllSettings.push(new gpoSetting("weatherWidget"));
    },
    Load:function(ret) {
        var obj=this;
        
        // Alle Optionen lesen
        $.each(obj.AllSettings,function(index,value) {
            value.Get(function() {
                obj.ReadCount++;
                if (obj.ReadCount===obj.AllSettings.length) {
                    obj.Convert(ret);
                }
            });
        });
    },
    Convert:function(ret) {
        var obj=this;
        var json="";
        $.each(obj.AllSettings, function(index,value) {
            var strValue=value.Value;
            if (strValue==="undefined") {
                strValue=null;
            }
            if (strValue!==null && strValue!=="true" && strValue!=="false" && strValue.indexOf("[")!==0 && strValue.indexOf("{")!==0) {
                strValue="\""+strValue+"\"";
            }
            var strName=value.Name.substring(0,1).toUpperCase()+value.Name.substring(1);
            json+="\""+strName+"\":"+strValue+",";
        });
        json=json.substr(0,json.length-1) ;
        obj.Values=$.parseJSON("{"+json+"}");
        
        ret();
    },
    Get:function(key) {
        var obj=this;
        var foundSetting = $.grep(obj.AllSettings, function (e) {
            return e.Name === key;
        });
        return foundSetting[0].Value;
    }
};

var gpoSetting=function(settingname, defaultValue) {
    this.Name=settingname;
    this.Value;
    this.DefaultValue=defaultValue;
};

gpoSetting.prototype= {
    costructor: gpoSetting,
    Get:function(ret) {
        var obj=this;
        chrome.runtime.sendMessage( {
            Action: "GetSetting",
            Name: obj.Name
        }, function (response)
        {
            obj.Value=response.Result; 
            if (obj.DefaultValue!==undefined && (obj.Value===undefined || obj.Value===null)) {
                obj.Value=obj.DefaultValue;
            }
            ret();
        });
    }
}