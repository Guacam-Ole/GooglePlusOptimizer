var lnk;
var quickShares;
var circlesAsBookmark = false;
var clickCircles = [];
var demoStart = false;
var lnk;
var clearCircles = false;
var startClickCircles = false;
var finalizeCircleClick = false;

/**
 * Kreise des Users speichern
 */
function GetCircles() {

    document.addEventListener("DOMSubtreeModified", function()
    {
        // Kreise aktualisieren
        var kreise = [];
        $('.xMa.uQa').each(function() {
            var kreisname = $(this).text();
            if (kreise.indexOf(kreisname) < 0) {
                kreise.push(kreisname);
            }
        });
        chrome.runtime.sendMessage({Action: "SaveCircles", ParameterValue: JSON.stringify(kreise)});
    });
}

/**
 * Aktionen, wenn ein QuickShare ausgewählt wurde
 */
function QSEvents()
{
    if (clearCircles)
    {
        // Standard-auswahl beim teilen löschen
        if (lnk.closest('[role="article"]').parent() !== null)
        {
            lnk.closest('[role="article"]').parent().find('.g-h-f-m-bd-nb').each(function()
            {
                $(this).click();
            });

            clearCircles = false;
            startClickCircles = true;
        }
    }

    if (startClickCircles) 
    {
        // Kreisauswahl öffnen
        if (lnk.closest('[role="article"]').parent() !== null)
        {
            if (lnk.closest('[role="article"]').parent().find('.g-h-f-N-N').length > 0)
            {
                lnk.closest('[role="article"]').parent().find('.g-h-f-N-N').click();
            }
        }
        startClickCircles = false;
    }

    if (finalizeCircleClick)
    {
        // Alle Kreise ausgewählt, Letzte Schritte
        lnk.closest('[role="article"]').parent().find('[role="listbox"]').hide();
        if (circlesAsBookmark) {
            lnk.closest('[role="article"]').parent().find('[guidedhelpid="sharebutton"]').click();
        } else {
            lnk.closest('[role="article"]').parent().find('[role="textbox"]').focus();
        }
        lnk.closest('[role="article"]').parent().find('.ut.Ee.Yb.Wf').css({"height": 'auto'});
        finalizeCircleClick = false;
    }

    if (clickCircles.length > 0 && !clearCircles && !startClickCircles) 
    {
        // Kreise auswählen
        if (lnk.closest('[role="article"]').parent() !== null)
        {
            var lastCircle = clickCircles.pop();
            $('.d-A').each(function()
            {
                if ($(this).text().indexOf(lastCircle) === 1) {
                    $(this).click();

                }
            });

            if (clickCircles.length === 0) {
                finalizeCircleClick = true;
            }
        }
    }
}

/**
 * Icons für QuickShare zeichnen
 */
function PaintQsIcons() {
    if (quickShares.length > 0)
    {
        $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("./setup/css/qs.css") + "' type='text/css' media='screen' />"));
        $('.Qg').each(function() {
            if ($(this).parent().find('.quickShare').length === 0)
            {
                var iconHtml = "";

                for (var i in quickShares) {
                    var qs = quickShares[i];
                    iconHtml = iconHtml + '<div><img isBookmark="' + qs.BookMarkMode + '" circles="' + qs.Circles + '" class="quickShareImg" src="' + qs.Image.replace("enabled", "disabled") + '" title="' + qs.Circles + '"/></div>';
                }
                $(this).before('<div class="quickShare">' + iconHtml + '<br/></div>');
            }
        });

        $('.quickShareImg').hover(
                function() {
                    var oldName = $(this).prop("src");
                    $(this).prop("src", oldName.replace("disabled", "enabled"));
                },
                function() {
                    var oldName = $(this).prop("src");
                    $(this).prop("src", oldName.replace("enabled", "disabled"));
                });
        $('.quickShareImg').click(function()
        {
            StartAutoClick($(this));
        });
    }
}

/**
 * Quickshare-Aktion starten
 * @param {object} container $-Container für Icon
 */
function StartAutoClick(container)
{
    lnk = container;
    clickCircles = container.attr("circles").split(',');
    clearCircles = true;
    circlesAsBookmark = JSON.parse(container.attr("isBookmark"));

    lnk.closest('[role="article"]').find('.Dg.Ut').click();
}
