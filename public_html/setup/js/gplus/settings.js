
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
        obj.AllSettings.push(new gpoSetting("StoppWatch"));
        obj.AllSettings.push(new gpoSetting("Schniedel"));
        obj.AllSettings.push(new gpoSetting("Wutz"));
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
            if (strValue!==null) {
                strValue="\""+strValue+"\"";
            }
            json+="\""+value.Name+"\":"+strValue+",";
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

var gpoSetting=function(settingname) {
    this.Name=settingname;
    this.Value;
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
            ret();
        });
    }
}