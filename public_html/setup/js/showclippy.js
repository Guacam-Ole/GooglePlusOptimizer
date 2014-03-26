
var clippyTexts = new Array();
clippyTexts[1] = "Hallo! Ich bin Karl Klammer, der neue/alte Helfer für Google. ";
clippyTexts[3] = "Kennst Du schon Google+? Versuch es einfach mal! Tippe plus.google.com in die Adresszeile";
clippyTexts[5] = "Wenn Du möchtest, kann Google automatisch Inhalte für Dich übersetzen. Achte auf die oberste Zeile im Browser.";
clippyTexts[7] = "Ich war übrigens ein beliebter Assistent in den 80er Jahren. Dank Google bin ich jetzt im Web 2.0 wieder da!";
clippyTexts[9] = "Wusstest Du, dass Google Chrome viel besser ist als der Internet Explorer?";
clippyTexts[11] = "Klar wusstest Du das. Schließlich benutzt Du ja Chrome. Toll!";
clippyTexts[13] = "Wenn Du weitere Assistenen anzeigen möchtest, schreibe in Google+ Einen Beitrag mit dem Hashtag #MehrAgenten und teile diesen Öffentlich. Als Antwort wirst Du automatisch Links zu weiteren Agenten bekommen";
clippyTexts[15] = "Probier aus, womit ich Dir helfen kann. Wenn Du zum Beispiel 'Welcher Tag ist heute? #FragKarl' in das Suchfeld einträgst, verrate ich Dir das heutige Datum.";
clippyTexts[17] = "Heute ist der 01.04.2014";
clippyTexts[19] = "Also, der erste April...";
clippyTexts[21] = "Also: APRIL! APRIL!";
clippyTexts[23] = "Dieser Aprilscherz wurde präsentiert vom Google Optimizer. :D";
clippyTexts[25] = "Dann lass ich Karl mal verschwinden... :)";
var clippyPause = 5000;
var clippyCount = 0;
var clippyAgent;

function delayedAlert()
{
    timeoutID = window.setTimeout(showAlert, clippyPause);
}

function showAlert()
{
    clippyCount++;
    if (clippyCount % 2 === 0)
    {
        clippyAgent.stopCurrent();
        clippyAgent.closeBalloon();
        clippyAgent.animate();
        delayedAlert();
    } else {
        if (clippyCount === 27)
        {
            // Weg damit...
            clippyAgent.hide();
            localStorage.setItem("hideclippy", true);
        } else {
            clippyAgent.speak(clippyTexts[clippyCount], true);
            clippyPause = clippyTexts[clippyCount].length * 70;
            delayedAlert();
        }
    }
}

$(document).ready(function()
{
    if (document.location.href.indexOf("www.google.") > 0)
    {
        var hideClippy = localStorage.getItem("hideclippy") || false;
        if (!hideClippy) {
            var date = new Date();
            var dd = date.getDate();
            var mm = date.getMonth() + 1;
            console.log(dd + "." + mm);
            if (mm === 4 && dd === 1) 
            {
                $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("setup/css/clippy.css") + "' type='text/css' media='screen' />"));
                clippy.load('Clippy', function(agent)
                {
                    agent.show();
                    agent.moveTo(600, 100);
                    //agent.speak(clippyTexts[0]);
                    clippyAgent = agent;
                    delayedAlert();
                }
                );
            }
        }
    }
});


