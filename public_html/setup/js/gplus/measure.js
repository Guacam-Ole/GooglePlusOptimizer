var gpoMeasure=function(scope, doCollect) {
    this.Scope=scope;
    this.MeasureMents=[];
    this.DoCollect=doCollect;
    chrome.runtime.sendMessage({Action: "DeleteTicks", Scope: scope});
};


gpoMeasure.prototype = {
    constructor: gpoMeasure,
    Do:function(featureName, ret) {
        var obj=this;
        
        if (obj.DoCollect) {
            var startTime=$.now();
            ret();
            var endTime=$.now();
            obj.Save(featureName,startTime, endTime);
        } else {
            ret();
        }
    },
    Save:function(featureName, start,stop) {
        var obj=this;
        chrome.runtime.sendMessage({Action: "AddTick", Scope: obj.Scope, Name: featureName, Start: start, Stop:stop});
    }
}
    