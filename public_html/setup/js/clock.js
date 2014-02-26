
var clockHasStarted = false;
var isPause = false;
var startTime;
var tmpSeconds = 59;


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
            sounds: ["bell_ring"],
            path: chrome.extension.getURL("./setup/js/"),
            multiPlay: true,
            volume: "1.0"
        });
        var minutes;

        var refreshId = setInterval(function()
        {
            if (!clockHasStarted || isPause)
            {
                return;
            }
            var now = new Date();
            var diff = targetTime - now;
            var seconds = Math.floor(diff / 1000); //ignore any left over units smaller than a second
            minutes = Math.floor(seconds / 60);
            seconds = seconds % 60;
            tmpSeconds = seconds;
            if (diff <= 60 * 1000)
            {
                PlayAlarm(5);
                clockHasStarted = false;
                tmpSeconds = 59;
                $('#dialMinutes').val(0).trigger("change");
            }
            else
            {
                $('#dialSeconds').val(seconds).trigger("change");
                $('#dialMinutes').val(minutes).trigger("change");
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
function PlayAlarm(maxCount)
{
    try {
        var alarmCount = 0;
        var refreshAlarm = setInterval(function()
        {
            alarmCount++;
            if (alarmCount === maxCount) {
                clearInterval(refreshAlarm);
            }
            $.ionSound.play("bell_ring");
        }, 1000

                );
    } catch (ex) {
        console.log(ex);
    }
}


/**
 * Timer initialisieren
 */
function InitTimer() {

    clockHasStarted = false;
    $(document).ready(function()
    {
        try {
            clockHasStarted = false;

            $(function($) {
                $(".knob").knob({
                });
            });

            PaintWatch();

            $('.bottomclock').click(function() {
                var bottomClock = $('.bottomclock');
                if (bottomClock.text() === chrome.i18n.getMessage("Pause"))
                {
                    if (clockHasStarted) {
                        bottomClock.text(chrome.i18n.getMessage("Fortsetzen"));
                        isPause = true;
                    }
                } else {
                    bottomClock.text(chrome.i18n.getMessage("Pause"));
                    StartTimer();
                }
            });

            $('.topclock').click(function()
            {
                $('.bottomclock').text(chrome.i18n.getMessage("Pause"));
                var topClock = $('.topclock');
                if (topClock.text() === chrome.i18n.getMessage("Stoppuhr_starten"))
                {
                    if ($('#dialMinutes').val() > 0)
                    {
                        topClock.text(chrome.i18n.getMessage("Stoppuhr_stoppen"));
                        StartTimer();
                    }
                } else {
                    tmpSeconds = 59;
                    topClock.text(chrome.i18n.getMessage("Stoppuhr_starten"));
                    clockHasStarted = false;
                    $('#dialSeconds').val(0).trigger("change");
                    $('#dialMinutes').val(0).trigger("change");
                }
            });
        } catch (ex) {
            console.log(ex);
        }
    });

    $('.knob').knob();
}
/**
 * Timer starten
 */
function StartTimer()
{
    try {
        var timerMinutes = JSON.parse($('#dialMinutes').val());
        startTime = new Date();
        targetTime = new Date();
        targetTime.setMinutes(startTime.getMinutes() + timerMinutes);
        targetTime.setSeconds(startTime.getSeconds() - 1 + JSON.parse(tmpSeconds));
        isPause = false;
        clockHasStarted = true;
        ShowNotificationSuccess(title, text);
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
        var clockWrapper = "<div style=\"height:300px;\" class=\"Ee fP Ue\" role=\"article\"><div class=\"a5 Gi\"><h3 class=\"EY Ni zj\"><span>" + chrome.i18n.getMessage("Stoppuhr") + "</span></h3>__CLOCKBLOCK__</div></div>";
        var secondTimer = "<div class=\"divSecond\"><input id=\"dialSeconds\" data-cursor=\"20\" class=\"knob\" data-width=\"132\" data-height=\"132\" data-thickness=\"0.22\" data-min=\"0\" data-max=\"59\" data-readOnly=\"true\" data-displayInput=\"false\" data-fgcolor=\"#999\" data-bgcolor=\"#FFFFFF\" value=\"0\" style=\"position: relative !important; margin-top: -300px !important; color:#999 !important;\" /></div>";
        var minuteTimer = "<div class=\"divMinute\"><input id=\"dialMinutes\" class=\"knob\" data-width=\"220\" data-height=\"220\" data-thickness=\"0.4\" data-min=\"0\" data-max=\"59\" data-readOnly=\"false\" data-fgcolor=\"#427fed\" data-bgcolor=\"#E5E5E5\" value=\"0\" style=\"position: relative !important; margin-top: -210px !important; color:\"#427fed\" !important;\" /></div>";
        var clockButtons = "<button type=\"button\" class=\"clockbtn topclock\">Stoppuhr starten</button><button type=\"button\" class=\"clockbtn bottomclock \">Pause</button>";

        var complete = clockWrapper.replace("__CLOCKBLOCK__", secondTimer + minuteTimer + clockButtons);
        $('#clock').append(complete);
        UpdateWatch();
    } catch (ex) {
        console.log(ex);
    }
}

