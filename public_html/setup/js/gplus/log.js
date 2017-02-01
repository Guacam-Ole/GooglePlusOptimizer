/**
 * Created by Tomato on 26.03.2015.
 */


var gpoLog = function () {
    this.Mode="INFO";
};

gpoLog.prototype = {
    constructor: gpoLog(),
    Init: function () {
        var debugMode=localStorage.getItem("DebugMode");
        if (debugMode!==null && debugMode!==undefined) {
            this.Mode=debugMode;
        }
    },
    Debug:function(message) {
        if (this.Mode==="DEBUG") {
            this.Log("DEBUG",message);
        }
    },
    Info:function(message) {
        if (this.Mode==="INFO" || this.Mode==="DEBUG") {
            this.Log("INFO",message);
        }
    },
    Warn:function(message) {
        if (this.Mode==="WARN" || this.Mode==="INFO" || this.Mode==="DEBUG") {
            this.Log("WARN",message);
        }
    },
    Error:function(message) {
        if (this.Mode==="ERROR" || this.Mode==="WARN" || this.Mode==="INFO" || this.Mode==="DEBUG") {
            this.Log("ERROR",message);
        }
    },
    Log: function (mode, message) {
        console.log("["+new Date().toLocaleString()+"] "+mode+" "+message);
    }
}