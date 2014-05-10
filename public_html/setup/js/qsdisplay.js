var lnk;
var quickShares = [];
var circlesAsBookmark = false;
var clickCircles = [];
var demoStart = false;
var lnk;
var clearCircles = false;
var startClickCircles = false;
var finalizeCircleClick = false;
var qsStep = -1;
var clickHandlerAdded = false;

/**
 * Kreise des Users speichern
 */

function InitQS()
{
    $(document).on('mouseenter', '.quickShareImg', function()
    {
        var oldName = $(this).prop("src");
        $(this).prop("src", oldName.replace("disabled", "enabled"));
    });
    $(document).on('mouseleave', '.quickShareImg', function()
    {
        var oldName = $(this).prop("src");
        $(this).prop("src", oldName.replace("enabled", "disabled"));
    });
    $(document).on('click', '.quickShareImg', function()
    {
        StartAutoClick($(this));
    });
    $(document).on('click', '.UN', function()
    {
        if (qsStep > 0) {
            qsStep = 1;
        }
    });
}

function GetCircles()
{
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
    switch (qsStep)
    {
        case 0:
//            lnk.closest('[role="article"]').find('.d-k-l.b-c.b-c-R.UN').click();
            qsStep++;
            break;
        case 1:

            // Standard-auswahl beim teilen löschen
            if (lnk.closest('[role="article"]').parent() !== null)
            {
                lnk.closest('[role="article"]').parent().find('.g-h-f-m-bd-nb').each(function()
                {
                    $(this).click();
                });

                qsStep++;
            }
            break;
        case 2:
            // Kreisauswahl öffnen
            if (lnk.closest('[role="article"]').parent() !== null)
            {
                if (lnk.closest('[role="article"]').parent().find('.g-h-f-N-N').length > 0)
                {
                    lnk.closest('[role="article"]').parent().find('.g-h-f-N-N').click();
                    qsStep++;
                }
            }


            break;
        case 3:
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
                    qsStep++;
                }
            }
            break;
        case 4:
            // Alle Kreise ausgewählt, Letzte Schritte
            lnk.closest('[role="article"]').parent().find('[role="listbox"]').hide();
            if (circlesAsBookmark) {
                lnk.closest('[role="article"]').parent().find('[guidedhelpid="sharebutton"]').click();
            } else {
                lnk.closest('[role="article"]').parent().find('[role="textbox"]').focus();
            }
            lnk.closest('[role="article"]').parent().find('.ut.Ee.Yb.Wf').css({"height": 'auto'});
            qsStep = -1;
            break;
    }
}

/**
 * Icons für QuickShare zeichnen
 */
function PaintQsIcons() {    
    if (quickShares!==null && quickShares.length > 0)
    {
        $('[jsname="MxEsy"]:not(:has(.quickShare))>.Qg').each(function()
        {
            // normale
            var iconHtml = "";

            for (var i in quickShares) {
                var qs = quickShares[i];
                iconHtml = iconHtml + '<div><img isBookmark="' + qs.BookMarkMode + '" circles="' + qs.Circles + '" class="quickShareImg" src="' + qs.Image.replace("enabled", "disabled") + '" title="' + qs.Circles + '"/></div>';
            }
            $(this).before('<div class="quickShare">' + iconHtml + '<br/></div><div class="qscl"></div>');
        });

        $('.yM.bD:not(:has(.quickShare))>.Qg').each(function()
        {
            // breite
            var iconHtml = "";

            for (var i in quickShares) {
                var qs = quickShares[i];
                iconHtml = iconHtml + '<div><img isBookmark="' + qs.BookMarkMode + '" circles="' + qs.Circles + '" class="quickShareImg" src="' + qs.Image.replace("enabled", "disabled") + '" title="' + qs.Circles + '"/></div>';
            }
            $(this).before('<div class="quickShare">' + iconHtml + '<br/></div><div class="qscl"></div>');
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
    circlesAsBookmark = JSON.parse(container.attr("isBookmark"));
    lnk.closest('[role="article"]').find('.Dg.Ut').click();

    qsStep = 1;
}
