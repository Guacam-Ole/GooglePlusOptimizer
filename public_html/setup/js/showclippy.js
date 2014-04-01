
var clippyTexts = new Array();
clippyTexts[1] = "Hallo! Ich bin Karl Klammer, der neue/alte Helfer für Google. ";
clippyTexts[3] = "Ich werde Dir ab jetzt noch schneller helfen, wenn Du etwas Bestimmtes suchst.";
clippyTexts[5] = "Wenn Du möchtest, kann Google automatisch Inhalte für Dich übersetzen. Achte auf die oberste Zeile im Browser.";
clippyTexts[7] = "Brauchst Du Hilfe? Schreibe einen öffentlichen Beitrag in Google+ mit dem Hashtag #FragKarl";
clippyTexts[9] = "Wenn Du 'Welcher Tag ist heute? #FragKarl' in das Suchfeld einträgst, verrate ich Dir das heutige Datum.";
clippyTexts[11] = "Heute ist der 01.04.2014";
clippyTexts[13] = "Also, der erste April...";
clippyTexts[15] = "*** APRIL! APRIL! *** Karl Klammer kommt natürlich nicht nach Google...";
clippyTexts[17] = "Dieser Aprilscherz wurde Dir präsentiert vom Google+ Optimizer. :D";
var clippyPause = 5000;
var clippyCount = 0;
var clippyAgent;

function delayedAlert()
{
    timeoutID = window.setTimeout(showAlert, clippyPause);
}

function showAlert()
{
    try {
        clippyCount++;
        if (clippyCount % 2 === 0)
        {
            clippyAgent.stopCurrent();
            clippyAgent.closeBalloon();
            clippyAgent.animate();
            delayedAlert();
        } else {
            if (clippyCount > 4) {
                localStorage.setItem("hideclippy", true);
            }
            if (clippyCount === 19)
            {
                // Weg damit...
                clippyAgent.hide();
            } else {
                clippyAgent.speak(clippyTexts[clippyCount], true);
                clippyPause = clippyTexts[clippyCount].length * 70;
                delayedAlert();
            }
        }
    } catch (err) {
    }
}

$(document).ready(function()
{
    try {
        if (document.location.href.indexOf("www.google.") > 0)
        {
            var hideClippy = localStorage.getItem("hideclippy") || false;
            if (!hideClippy) {
                var date = new Date();
                var dd = date.getDate();
                var mm = date.getMonth() + 1;
                if (mm === 4 && dd === 1)
                {
                    $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("setup/css/clippy.css") + "' type='text/css' media='screen' />"));
                    clippy.load('Clippy', function(agent)
                    {
                        agent.show();
                        agent.moveTo(600, 100);
                        clippyAgent = agent;
                        delayedAlert();
                    }
                    );
                }
            }
        }
    } catch (err) {

    }
});
