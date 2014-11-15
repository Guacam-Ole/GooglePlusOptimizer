var gpoClock=function() {
    this.HasStarted = false;
    this.StartTime;
    this.Seconds = 59;
    this.ClockObj=null;
    this.Minutes;
    this.TargetTime;
    
};

gpoClock.prototype = {
    constructor: gpoClock,
    Init: function () {        
        var obj=this;
        $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("./setup/css/jquery-ui.min.css") + "' type='text/css' media='screen' />"));
        $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("./setup/css/clock.css") + "' type='text/css' media='screen' />"));
        var clockWrapper="<div class= 'clock'><div class='clockLabel'></div><div class='slider-clock'></div><div style='clear:both'></div></div>";
        obj.ClockObj=$(clockWrapper);
        
        obj.HasStarted = false;
        
        $(document).on("slide",".slider-clock",function(event,ui) {
            obj.Display(ui.value);
        });
        $(document).on("slidestop",".slider-clock",function(event,ui) {
             obj.StartTimer(ui.value);
        });
        
        
        $(document).ready(function() {
            try {
               
                obj.HasStarted = false;
                obj.PaintWatch();
            } catch (ex) {
                console.log(ex);
            }
        });
        // Nach einem Reload schauen, ob evtl. noch ein alter Timer gespeichert ist:
        var oldValue=localStorage.getItem("StopWatchTargetTime");
        if (oldValue!==null && oldValue!==undefined) {
            obj.HasStarted = true;
            obj.TargetTime=new Date(oldValue);
        };
        
        console.log("Clock started.");  
    },
    UpdateWatch:function() {
         try {
            var obj=this;
            var minutes;

            var refreshId = setInterval(function()
            {
                

                if (!obj.HasStarted )
                {
                    return;
                }
                var now = new Date();
                var diff = obj.TargetTime - now;
                domChangeAllowed = false;
                
                if (diff <=  0)
                {
                    $(".slider-clock").slider('value',0);
                    $('.clockLabel').text("00:00");
                    obj.PlayAlarm();
                    localStorage.removeItem("StopWatchTargetTime");
                    
                    obj.HasStarted = false;
                    obj.Seconds = 0;
                    obj.Display(0);
                   // clearInterval(refreshId);
                }
                else
                {
                    var seconds = Math.floor(diff / 1000); 
                    minutes = Math.floor(seconds / 60);
                    seconds = seconds % 60;
                    obj.Seconds = seconds;

                    var lblMinutes=minutes;
                    if (minutes<10) {
                        lblMinutes="0"+lblMinutes;
                    }
                    var lblSeconds=seconds;
                    if (seconds<10) {
                        lblSeconds="0"+lblSeconds;
                    }
                    $('.clockLabel').text(lblMinutes+":"+lblSeconds);
                    if (minutes!==obj.Minutes) {
                        obj.Minutes=minutes;
                        $(".slider-clock").slider('value',minutes+1);
                    }
                    domChangeAllowed = false;
                    AllowDomChange();
                }
            }, 1000);
        } catch (ex) {
            console.log(ex);
        }
    },
    PlayAlarm:function() {
         try {
            $.ionSound({
               sounds: ["hamster"],
               path: chrome.extension.getURL("./setup/media/"),
               multiPlay: true,
               volume: "1.0"
           });
           $.ionSound.play("hamster");
       } catch (ex) {
           console.log(ex);
       }
    },
    Display:function(minutes) {
        var lblMinutes=minutes;
        if (minutes<10) {
            lblMinutes="0"+lblMinutes;
        }
        $('.clockLabel').text(lblMinutes+":00");   
    },
    StartTimer:function(minutes) {
        var obj=this;
        try {
            obj.StartTime= new Date();
            obj.TargetTime = new Date();
            obj.TargetTime.setMinutes(obj.StartTime.getMinutes() + minutes);
            obj.TargetTime.setSeconds(obj.StartTime.getSeconds());
            localStorage.setItem("StopWatchTargetTime",obj.TargetTime.toISOString());
            obj.HasStarted = true;
        } catch (ex) {
            console.log(ex);
        }  
    },
    PaintWatch:function() {
        try {
            var obj=this;
            if ($('.clock').length===0) {
                  $('.ona.Fdb').prepend(obj.ClockObj);
                  $('.clockLabel').text("00:00");
                  $( ".slider-clock" ).slider({value: 0,min: 0,max: 60 });
                  obj.UpdateWatch();
            }
        } catch (ex) {
           console.log(ex);
        }    
    }
};

