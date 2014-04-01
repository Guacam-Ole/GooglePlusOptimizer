console.log('g+ - filter started');
// Einstellungen G+-LiveTracking
var filterPlus1;
var filterYouTube;
var filterWham;
var filterHashTag;
var filterCustom;
var filterCommunity;
var filterBirthday;
var filterPersons;
var propsHashtags;
var propsFulltext;
var whamWhamText;
var whamWhamLink;
var whamChristmasText;
var whamChristmasLink;
var anyFilterEnabled;
var interval;
var wetter;
var soccer;
var clock;
var colorUsers;
var filterImages;
var filterVideo;
var filterLinks;
var filterGifOnly;
var filterMp4Only;
var showTrophies;
var trophies;
var showEmoticons;
var columnCount;
var lastWizardVersion;
var domChangeAllowed = true;

function IsDemo() {
    return  document.location.search.indexOf("demoMode") > 0;
}


$(document).ready(function()
{
    if (document.title.indexOf("Google+ Filter") !== -1)  	// Setup-Seiten
    {
        LoadSetup();
    }
    else if (document.title.indexOf("Google+") !== -1)
    {
        if (IsDemo()) {
            var button = $('<span role="button" id="optimizerTest" class="Cy" aria-pressed="false" tabindex="0"><a>Optimizer aktivieren</a></span>');
            $('.Ima.Xic').prepend(button);
            $('#optimizerTest').click(function() {
                demoStart = !demoStart;
                StartUpGoogleFilter();
                return false;
            });
        }
        LoadAllQuickSharesG();
        InitGoogle();
        GetAllCircles();


    }
});

function GetAllCircles()
{
    // Kreise auslesen
    $('script').each(function() {
        try {
            if (this.innerHTML.indexOf("AF_initDataCallback({key: '12'") > -1)
            {
                var newCircles = [];
                var complete = this.innerHTML;
                var startJSON = complete.indexOf('[');
                var endJSON = complete.lastIndexOf(']');
                var cstr = complete.substring(startJSON, endJSON + 1);

                while (cstr.indexOf(",,") > 0)
                {
                    cstr = cstr.replace(",,", ",null,")
                }
                ;
                var allCircles = $.parseJSON(cstr);
                if (allCircles.length === 1)
                {
                    for (i = 0; i < allCircles[0].length; i++) {
                        if (allCircles[0][i].length === 2 && allCircles[0][i][1].length === 16)
                        {
                            var circleName = allCircles[0][i][1][0];
                            newCircles.push(circleName);
                        }
                    }
                }
                chrome.runtime.sendMessage({Action: "SaveCircles", ParameterValue: JSON.stringify(newCircles)})
            }
        } catch (ex) {
        }
    });
}

function StartUpGoogleFilter() {
    if (!IsDemo() || demoStart) {
        CreateAutoSaveEvents();

        LoadGoogle();
        CountColumns();


        if (colorUsers)
        {
            OptStartColors();
        }
    }
}

/**
 * Wizard-Kachel zeichnen
 */
function DrawWizardTile() {
    try {
        var lang = chrome.i18n.getMessage("lang");
        if (NewWizardOptionsExist(lastWizardVersion)) {
            $.get(chrome.extension.getURL("setup/" + lang + "/wizardloader.html"), function(htmlWizard) {
                var htmlObject = $('<div/>').html(htmlWizard).contents();
                $('.Ypa.jw.am :first').prepend(htmlObject.find('[data-iid="wizard"]'));
                $('#wizardStart').click(function() {
                    $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("setup/css/bootstrap-switch.css") + "' type='text/css' media='screen' />"));
                    $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("setup/css/wizard.css") + "' type='text/css' media='screen' />"));
                    var wizz = $('<div id="loadhere">&nbsp;</div>');
                    $('body').prepend(wizz);
                    $('#loadhere').load(chrome.extension.getURL("setup/" + lang + "/wizard.html"), function() {
                        InitWizard(lastWizardVersion);
                        OptStartTrophies();
                        console.log('Wizard loaded');
                    });
                });
            });
        }
    } catch (ex) {
        console.log(ex);
    }
}

/**
 * Aktionen beim initialisieren der Seite
 */
function InitGoogle()
{
    try {
        var interval = JSON.parse(localStorage.getItem("interval"));
        if (interval === null || interval < 10)
        {
            interval = 500;
        }
        LoadSettingsLive();
        chrome.extension.sendMessage("show_page_action");
    } catch (ex) {
        console.log(ex);
    }
}

/**  
 * Google+ - Aktionen, wenn DOM bereit
 */
function LoadGoogle()
{
    console.log('G+Filter: Google+ - Filter initialisiert');
    StartFilter(); // Initial ausführen

    var timeout = null;
    document.addEventListener("DOMSubtreeModified", function()
    {


        // Beim Nachladen der Seite neu aktiv werden
        if (timeout)
        {
            clearTimeout(timeout);
        }
        timeout = setTimeout(StartFilter, interval); // Ajax request (Scrollen: Alle halbe Sekunde checken)    
    }, false);
    DrawWidgets();
}

/**
 * Widgets zeichnen
 */
function DrawWidgets() {
    try {
        if (wetter === "null") {
            wetter = null;
        }
        if (soccer === "null") {
            soccer = null;
        }
        if (clock === "null") {
            clock = null;
        }

        // Wetter checken:
        if (wetter !== null && wetter !== undefined)
        {
            $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("./setup/css/weather.css") + "' type='text/css' media='screen' />"));
            OptStartWeather();
            StartWeather();
        }

        if (soccer !== null && soccer !== undefined)
        {
            $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("./setup/css/sport.css") + "' type='text/css' media='screen' />"));
            OptStartSoccer();
            StartSoccer();
        }

        if (clock !== null && clock !== undefined)
        {
            OptStartClock();
            $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("./setup/css/clock.css") + "' type='text/css' media='screen' />"));
            CreateBlock(JSON.parse(clock) + 1, "clock");
            InitTimer();
        }
    } catch (ex) {
        console.log(ex);
    }
}

function LoadAllQuickSharesG()
{
    chrome.runtime.sendMessage(
            {
                Action: "LoadQS"
            }, function(response)
    {
        quickShares = JSON.parse(response.Result);
        if (quickShares.length > 0)
        {
            $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("./setup/css/qs.css") + "' type='text/css' media='screen' />"));
        }
    });
}

/**
 * Spalten zählen
 */
function CountColumns()
{
    try {
        var $wrapper = $('.ona.Fdb');
        if ($wrapper.length > 0)
        {
            var columns = $wrapper.find('.Ypa.jw.am').first().nextUntil(':not(.Ypa.jw.am)').addBack().length;
            if (columns > 0)
            {
                chrome.runtime.sendMessage({Action: "SaveColumns", ParameterValue: columns});
            }
        }
    } catch (ex) {
        console.log(ex);
    }
}

/**
 * Filteraktionen (bei jeder DOM-Änderung)
 */
function StartFilter()
{
    if (quickShares.length > 0) {
        QSEvents();
    }
    if (!domChangeAllowed) {
        // Es wird bereits eine Anpassung durchgeführt
        return;
    }
    setInterval(function() {
        domChangeAllowed = true; // Nach 5 Sekunden Änderungen wieder erlauben
    }, 5000);
    domChangeAllowed = false;

    if (filterPlus1)
    {
        $('.xv').closest("[jsmodel='XNmfOc']").hide();
    }
    if (filterYouTube)
    {
        $('.SR').closest("[jsmodel='XNmfOc']").hide();
    }
    if (filterWham)
    {
        if (whamWhamText)
        {
            $('.Xx.xJ:contains("wham")').closest("[jsmodel='XNmfOc']").hide();
            $('.Xx.xJ:contains("Wham")').closest("[jsmodel='XNmfOc']").hide();
            $('.Xx.xJ:contains("WHAM")').closest("[jsmodel='XNmfOc']").hide();
        }
        if (whamChristmasText)
        {
            $('.Xx.xJ:contains("Last Christmas")').closest("[jsmodel='XNmfOc']").hide();
            $('.Xx.xJ:contains("last christmas")').closest("[jsmodel='XNmfOc']").hide();
            $('.Xx.xJ:contains("LastChristmas")').closest("[jsmodel='XNmfOc']").hide();
            $('.Xx.xJ:contains("lastchristmas")').closest("[jsmodel='XNmfOc']").hide();
        }
        if (whamWhamLink)
        {
            $('.yx.Nf:contains("wham")').closest("[jsmodel='XNmfOc']").hide();
            $('.yx.Nf:contains("Wham")').closest("[jsmodel='XNmfOc']").hide();
            $('.yx.Nf:contains("WHAM")').closest("[jsmodel='XNmfOc']").hide();
        }
        if (whamChristmasLink)
        {
            $('.yx.Nf:contains("Last Christmas")').closest("[jsmodel='XNmfOc']").hide();
            $('.yx.Nf:contains("last christmas")').closest("[jsmodel='XNmfOc']").hide();
            $('.yx.Nf:contains("LastChristmas")').closest("[jsmodel='XNmfOc']").hide();
            $('.yx.Nf:contains("lastchristmas")').closest("[jsmodel='XNmfOc']").hide();
        }
    }

    //var hinzu = "<span role=\"listitem\" class=\"g-h-f-za\" id=\":yi\" tabindex=\"-1\"><span class=\"g-h-f-za-yb\"><span class=\"g-h-f-m-wc g-h-f-m\"><div style=\"position: absolute; top: -1000px;\">Symbol Circle</div></span> <span class=\"g-h-f-za-B\">Lonely Circle</span>&nbsp;<div role=\"button\" aria-label=\"Lonely Circle entfernen\" tabindex=\"0\" class=\"g-h-f-m-bd-nb\"><span class=\"g-h-f-m g-h-f-m-bd\"></span></div></span></span>";

    if (filterCommunity)
    {
        $('[data-iid="sii2:112"]').hide();
        $('[data-iid="sii2:116"]').hide();
    }
    if (filterBirthday)
    {
        $('[data-iid="sii2:114"]').hide();
    }
    if (filterPersons)
    {
        $('[data-iid="sii2:103"]').hide();
    }

    DOMFilterHashtags();
    DOMFilterImages();
    DOMFilterFreetext();
    if (colorUsers)
    {
        PaintForUser();
        PaintColorBlock();
    }

    if (showTrophies)
    {
        OptStartTrophyDisplay();
        DrawTrophies();
    }

    if (showEmoticons)
    {
        OptStartEmoticons();
        PaintEmoticons();
    }
    InitQS();
    PaintQsIcons();
}

/**
 * Volltextfilter
 */
function DOMFilterFreetext() {
    if (filterCustom && propsFulltext !== null && propsFulltext !== "")
    {
        try {
            var textArray = propsFulltext.split(',');
            $.each(textArray, function(i, fulltext)
            {
                $('.Xx.xJ:contains(' + fulltext + ')').closest("[jsmodel='XNmfOc']").hide();
            });
        } catch (ex) {
            console.log(ex);
        }
    }
}

/**
 * Bilder, Videos und Links ausblenden
 */
function DOMFilterImages() {
    try {
        if (filterImages || filterLinks || filterVideo)
        {
            $('.unhideImage').click(function() {
                $(this).parent().find('.hidewrapper').show();
                $(this).remove();
                return false;
            });
        }

        if (filterVideo)
        {
            if (filterMp4Only) {
                $('.sp.ej img[src$=".mp4"]').closest('.q9.yg').not(".hidewrapper .q9.yg").wrap("<div class='hidewrapper' style=\"display:none\"></div>").closest('.yx.Nf').prepend("<a href=\"#\" class=\"unhideImage\" >" + chrome.i18n.getMessage("DisplayVideo") + "</a>");
            } else {

                $('.sp.ej.bc.Ai').closest('.q9.yg').not(".hidewrapper .q9.yg").wrap("<div class='hidewrapper' style=\"display:none\"></div>").closest('.yx.Nf').prepend("<a href=\"#\" class=\"unhideImage\" >" + chrome.i18n.getMessage("DisplayVideo") + "</a>");
            }
        }
        if (filterLinks)
        {
            $('.sp.ej.Mt').closest('.q9.yg').not(".hidewrapper .q9.yg").wrap("<div class='hidewrapper' style=\"display:none\"></div>").closest('.yx.Nf').prepend("<a href=\"#\" class=\"unhideImage\" >" + chrome.i18n.getMessage("DisplayLink") + "</a>");
            $('.sp.ej.A8Hhid').closest('.q9.yg').not(".hidewrapper .q9.yg").wrap("<div class='hidewrapper' style=\"display:none\"></div>").closest('.yx.Nf').prepend("<a href=\"#\" class=\"unhideImage\" >" + chrome.i18n.getMessage("DisplayLink") + "</a>");
        }
        if (filterImages)
        {
            if (filterGifOnly)
            {
                $('.d-s.ob.Ks img[src$=".gif"]').closest('.q9.yg').not(".hidewrapper .q9.yg").wrap("<div class='hidewrapper' style=\"display:none\"></div>").closest('.yx.Nf').prepend("<a href=\"#\" class=\"unhideImage\" >" + chrome.i18n.getMessage("DisplayImage") + "</a>");
                $('.d-s.ob.Ks img[src$=".GIF"]').closest('.q9.yg').not(".hidewrapper .q9.yg").wrap("<div class='hidewrapper' style=\"display:none\"></div>").closest('.yx.Nf').prepend("<a href=\"#\" class=\"unhideImage\" >" + chrome.i18n.getMessage("DisplayImage") + "</a>");
            } else {
                $('.d-s.ob.Ks').closest('.q9.yg').not(".hidewrapper .q9.yg").wrap("<div class='hidewrapper' style=\"display:none\"></div>").closest('.yx.Nf').prepend("<a href=\"#\" class=\"unhideImage\" >" + chrome.i18n.getMessage("DisplayImage") + "</a>");
            }
        }

    }
    catch (ex) {
        console.log(ex);
    }
}

/**
 * Hashtags filtern
 */
function DOMFilterHashtags() {
    try {
        if (filterHashTag)
        {

            // Einfügen von hinzufügen-Button
            $('.zZ.a0').each(function(index, value)
            {
                if ($(this).find('a').length <= 1)
                {
                    $(this).append(" <a style=\"color:red\" href=\"#\" class=\"removeHashTag\"><img title=\"" + chrome.i18n.getMessage("RemarkPlaceholder") + "\" src=\"" + chrome.extension.getURL('setup/images/delete.png') + "\"/></a>");
                }
            });
            if (propsHashtags !== null && propsHashtags !== "")
            {
                var hashTagArray = propsHashtags.split(',');
                $.each(hashTagArray, function(i, hashTag)
                {
                    if (hashTag.length > 1) {
                        $('.zda.Zg:contains(' + hashTag + ')').closest("[jsmodel='XNmfOc']").hide();
                    }
                });
            }

            // Hashtag-Filter-Button geklickt
            $('.removeHashTag').on("click", function()
            {
                console.log('Add Hashtag');
                if (propsHashtags === null)
                {
                    propsHashtags = "";
                }
                var newHashtag = $(this).closest('.zZ').find('a')[0].innerText;
                if ((propsHashtags.indexOf(newHashtag + ",") >= 0) || propsHashtags.match(new RegExp("/" + newHashtag + "/$")))
                {
                    // Einmal reicht...
                    return;
                }
                propsHashtags += "," + newHashtag;
                chrome.runtime.sendMessage({Action: "SaveHashtags", ParameterValue: propsHashtags});
                $(this).hide();
                ShowNotification("success", "Hashtag wurde zum Filter hinzugefügt.", " Du wirst die nächste Zeit nichts mehr von " + newHashtag + " hören. Bitte Seite neu laden, um den Filter zu aktivieren.");
                return false;
            });
        }
    } catch (ex) {
        console.log(ex);
    }
}

/**
 * Einstellungen von Backgroundscript laden 
 */
function LoadSettingsLive()
{
    chrome.runtime.sendMessage(
            {
                Action: "LoadAll"
            }, function(response)
    {
        filterPlus1 = response.FilterPlus1;
        filterYouTube = response.FilterYouTube;
        filterWham = response.FilterWham;
        filterHashTag = response.FilterHashTag;
        filterCustom = response.FilterCustom;
        filterCommunity = response.FilterCommunity;
        filterBirthday = response.FilterBirthday;
        filterPersons = response.FilterPersons;
        propsHashtags = response.PropsHashtags;
        propsFulltext = response.PropsFulltext;
        whamWhamText = response.WhamWhamText;
        whamWhamLink = response.WhamWhamLink;
        whamChristmasText = response.WhamChristmasText;
        whamChristmasLink = response.WhamChristmasLink;
        interval = response.Interval;
        wetter = response.Wetter;
        soccer = response.Sport;
        clock = response.Stoppwatch;
        colorUsers = response.ColorUsers;
        filterImages = response.FilterImages;
        filterVideo = response.FilterVideo;
        filterLinks = response.FilterLinks;
        filterGifOnly = response.FilterGifOnly;
        filterMp4Only = response.FilterMp4Only;
        showTrophies = response.DisplayTrophy;
        showEmoticons = response.ShowEmoticons;
        lastWizardVersion = response.lastWizard;
        wizardMode = response.WizardMode;
        trophies = response.Trophies || null;
        autoSave = response.UseAutoSave;
        if (trophies !== null) {
            trophies = $.parseJSON(trophies);
        }
        localStorage.setItem("lastTrophyRead", response.LastTrophyRead);
        StartUpGoogleFilter();

        wizardMode = JSON.parse(wizardMode);

        if (wizardMode >= 0)
        {
            DrawWizardTile();
        }

    }
    );
}

/**
 * Widget-Block zeichnen
 * @param {int} position position der Spalte
 * @param {string} id Id des Blocks
 */
function CreateBlock(position, id)
{
    var wrapper = "<div  tabindex=\"-1\" class=\"nja\" id=\"" + id + "\"></div>";
    if (position === 1)
    {
        $('[data-iid="sii2:111"]').append(wrapper);
    } else
    {

        $(".ona.Fdb .Ypa:nth-child(" + position + ")").prepend(wrapper);
    }
}

/**
 * Meldung anzeigen
 * @param {string} notificationType Art der Meldung
 * @param {string} title Titel
 * @param {string} text Text
 */
function ShowNotification(notificationType, title, text)
{
    var style = "position: relative;vertical-align: middle;left: 20px;top: 15px;padding-left: 20px;padding-right: 20px;padding-top:10px;padding-bottom:10px;background-color: ";
    switch (notificationType) {
        case "error":
            style += "#FF7F7F";
            break;
        case "warning":
            style += "#FFE97F";
            break;
        case "success":
            style += "#A5FF7F";
            break;
        case "info":
            style += "#7FC9FF";
            break;
        default:
            style += "white";
            break;
    }
    style += ";";
    var messageBox = "<div id='gplusMessage' class='gplusMessage' style=\"" + style + "\"><b>" + title + ":</b>" + text + "</div>";
    $('.Ima.Xic').append(messageBox);
    timeout = setTimeout(ClearNotification, 10000);
}

/**
 * Meldung löschen
 */
function ClearNotification()
{
    $("#gplusMessage").remove();
}


