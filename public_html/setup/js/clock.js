
var clockHasStarted = false;
var startTime;
var tmpSeconds = 59;

var clockObj;


function OptStartClock() {
    console.log("Clock started.");
}

/**
 * Uhr aktualisieren
 */
function UpdateWatch()
{
    try {
        $.ionSound({
            sounds: ["hamster"],
            path: chrome.extension.getURL("./setup/js/"),
            multiPlay: true,
            volume: "1.0"
        });
        var minutes;

        var refreshId = setInterval(function()
        {
            if (!clockHasStarted )
            {
                return;
            }
            var now = new Date();
            var diff = targetTime - now;
            var seconds = Math.floor(diff / 1000); //ignore any left over units smaller than a second
            minutes = Math.floor(seconds / 60);
            seconds = seconds % 60;
            tmpSeconds = seconds;
            if (diff <=  0)
            {
                $("#slider-clock").slider('value',0);
                PlayAlarm();
                clockHasStarted = false;
                tmpSeconds = 59;
            }
            else
            {
                $("#slider-clock").slider('value',minutes+1);
                
                var lblMinutes=minutes;
                if (minutes<10) {
                    lblMinutes="0"+lblMinutes;
                }
                var lblSeconds=seconds;
                if (seconds<10) {
                    lblSeconds="0"+lblSeconds;
                }
                $('.clockLabel').text(lblMinutes+":"+lblSeconds);
            }
        }, 1000);
    } catch (ex) {
        console.log(ex);
    }
}

/**
 * Alarm abspielen
 * @param {int} maxCount Anzahl der Töne
 */
function PlayAlarm()
{
    try {
        $.ionSound.play("hamster");
        
    } catch (ex) {
        console.log(ex);
    }
}

function DisplayFromSlider(minutes) {
     var lblMinutes=minutes;
    if (minutes<10) {
        lblMinutes="0"+lblMinutes;
    }
    $('.clockLabel').text(lblMinutes+":00");
}

/**
 * Timer initialisieren
 */
function InitTimer() {
    $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("./setup/css/jquery-ui.min.css") + "' type='text/css' media='screen' />"));
    var clockWrapper="<div class= 'clock'><div class='clockLabel'></div><div id='slider-clock'></div><div style='clear:both'></div></div>";
    clockObj=$(clockWrapper);
    clockHasStarted = false;
    $(document).ready(function()
    {
        try {
             $(function() {
                $( "#slider-clock" ).slider({
                    value: 0,
                    min: 0,
                    max: 60,
                    slide: function( event, ui ) {
                        DisplayFromSlider(ui.value);
                    },
                    stop: function(event,ui) {
                        StartTimer(ui.value);
                    }
                });
            });
            clockHasStarted = false;
            PaintWatch();
        } catch (ex) {
            console.log(ex);
        }
    });
}
/**
 * Timer starten
 */
function StartTimer(timerMinutes)
{
    try {
       // var timerMinutes = JSON.parse($('#dialMinutes').val());
        startTime = new Date();
        targetTime = new Date();
        targetTime.setMinutes(startTime.getMinutes() + timerMinutes);
        targetTime.setSeconds(startTime.getSeconds());
        
        clockHasStarted = true;
       // ShowNotificationSuccess(title, text);
    } catch (ex) {
        console.log(ex);
    }
}

/**
 * Uhr zeichnen
 */
function PaintWatch()
{
    
    
    try {
        if ($('.clock').length===0) {
              $('.ona.Fdb').prepend(clockObj);
              $('.clockLabel').text("00:00");
  
            UpdateWatch();
        }
    } catch (ex) {
        console.log(ex);
    }
}

