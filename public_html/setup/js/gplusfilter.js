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
var filterSharedCircles;
var showTrophies;
var trophies;
var showEmoticons;
var columnCount;
var lastWizardVersion;
var domChangeAllowed = true;
var markLSRPosts;
var saveTicks;
var displayQuickHashes;
var domainBlacklist = [];


function IsDemo() {
    return  document.location.search.indexOf("demoMode") > 0;
}

// Case - INSensitive Contains Variant:
jQuery.expr[":"].Contains = jQuery.expr.createPseudo(function (arg) {
    return function (elem) {
        return jQuery(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
    };
});

$(document).ready(function ()
{
    if (document.title.indexOf("Google+ Filter") !== -1)  	// Setup-Seiten
    {
        LoadSetup();
    }
    else if (window.location.hostname === "plus.google.com")
    {
        $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("setup/css/simple.css") + "' type='text/css' media='screen' />"));
        if (IsDemo()) {
            var button = $('<span role="button" id="optimizerTest" class="Cy" aria-pressed="false" tabindex="0"><a>Optimizer aktivieren</a></span>');
            $('.Ima.Xic').prepend(button);
            $('#optimizerTest').click(function () {
                demoStart = !demoStart;
                StartUpGoogleFilter();
                return false;
            });
        }

        InitGoogle();

        $(document).on('click', '.unhideImage', function ()
        {
            $(this).parent().find('.hidewrapper').show();
            $(this).remove();
            return false;
        });

        $(document).on('click', '.removeHashTag', function ()
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
            AddHashtagToList(newHashtag);
            $(this).hide();

            return false;
        });


    }
});
function DisplayHashtags()
{
    if (displayQuickHashes) {

        $('#contentPane').parent().prepend('<div id="quickht">Quick-Hashtags:<br/></div>');
    }
}

function SortByName(a, b) {
    var aName = a.text.toLowerCase();
    var bName = b.text.toLowerCase();
    return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
}

function LoadHashTags()
{
    if (displayQuickHashes) {
        var lasthashtag;
        //if ($('#quickht')!==undefined) {
        $('#quickht')[0].innerHTML = "Quick-Hashtags:<br/>";

        var allLinks = $('a[href^="explore/"]').sort(SortByName);
        allLinks.each(function (i, val) {
            if (lasthashtag !== val.text.toLowerCase()) {
                lasthashtag = val.text.toLowerCase();
                $('#quickht').append('<a href="' + val.href + '">' + val.text + '</a><br/>');
            }
        });

    }
}

function GetAllCircles()
{

    // Kreise auslesen
    $('script').each(function () {
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
                    cstr = cstr.replace(",,", ",null,");
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
                chrome.runtime.sendMessage({Action: "SaveCircles", ParameterValue: JSON.stringify(newCircles)});
            }
        } catch (ex) {
        }
    });
}

function StartUpGoogleFilter() {
    if (!IsDemo() || demoStart) {
        CreateAutoSaveEvents();
        CleanupAutosave();
        LoadGoogle();
        CountColumns();
        InitBookmarks();
        if (colorUsers)
        {
            OptStartColors();
        }
        if (showTrophies)
        {
            StartTick(false, "LoadTrophyUsers");
            OptStartTrophyDisplay();
            StoppTick(false, "LoadTrophyUsers");
        }
        DisplayHashtags();
    }
}


function AddHeadWrapper(parent) {
    if (parent.html().indexOf('InfoUsrTop') === -1)
    {
        parent.prepend("<div class='InfoUsrTop'>");
    }
}

/**
 * Wizard-Kachel zeichnen
 */
function DrawWizardTile() {
    try {
        var lang = chrome.i18n.getMessage("lang");
        if (NewWizardOptionsExist(lastWizardVersion)) {
            $.get(chrome.extension.getURL("setup/" + lang + "/wizardloader.html"), function (htmlWizard) {
                var htmlObject = $('<div/>').html(htmlWizard).contents();
                $('.Ypa.jw.am :first').prepend(htmlObject.find('[data-iid="wizard"]'));
                $('#wizardStart').click(function () {
                    $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("setup/css/bootstrap-switch.css") + "' type='text/css' media='screen' />"));
                    $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("setup/css/wizard.css") + "' type='text/css' media='screen' />"));
                    var wizz = $('<div id="loadhere">&nbsp;</div>');
                    $('body').prepend(wizz);
                    $('#loadhere').load(chrome.extension.getURL("setup/" + lang + "/wizard.html"), function () {
                        InitWizard(lastWizardVersion);
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


    var timeout = null;
    document.addEventListener("DOMSubtreeModified", function ()
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
            }, function (response)
    {
        quickShares = JSON.parse(response.Result);
        if (quickShares !== null && quickShares.length > 0)
        {
            $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("./setup/css/qs.css") + "' type='text/css' media='screen' />"));
            InitQS();
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

function CleanDate(anyDate) {
    if (anyDate.indexOf("(") > 0) {
        return anyDate.substring(0, anyDate.indexOf("(") - 1);
    }
}

function MoveHeaderIcon() {
     if (displayBookmarks || showLang) {
        var icondiff=0;
        if (showLang) {
            icondiff+=60;
        }
        if (displayBookmarks) {
            icondiff+=60;
        }
        if ($('.V9b').length>0) {
            var oldStyle=$('.V9b').attr('style');
            if (oldStyle.indexOf("modified")===-1) {
                var oldValEnd=oldStyle.indexOf("px");
                var oldValStart=oldStyle.indexOf(" ");
                var oldVal=oldStyle.substring(oldValStart,oldValEnd);
                var oldValI=parseInt(oldVal);
                $('.V9b').attr('style',"right: "+(oldValI+icondiff)+"px; modified");
            }
        }
    }
}

/**
 * Filteraktionen (bei jeder DOM-Änderung)
 */
function StartFilter()
{

    if (quickShares !== null && quickShares.length > 0) {
        StartTick(false, "Quickshare");
        QSEvents();
        StoppTick(false, "Quickshare");
    }
    MoveHeaderIcon();

    if (!domChangeAllowed) {
        // Es wird bereits eine Anpassung durchgeführt
        return;
    }
    try {
        if (displayBookmarks === true) {
           // PaintStars();
        }   
        


        StartTick(false, "Hashtags");
        LoadHashTags();
        StoppTick(false, "Hashtags");
        StartTick(false, "Hashtag-Delete");
        AddMuelltonne();
        StoppTick(false, "Hashtag-Delete");

        if (filterPlus1)
        {
            StartTick(false, "Plus1");
            $('.xv').closest("[jsmodel='XNmfOc']").hide();
            StoppTick(false, "Plus1");
        }
        if (filterYouTube)
        {
            StartTick(false, "Youtube");
            $('.SR').closest("[jsmodel='XNmfOc']").hide();
            StoppTick(false, "Youtube");
        }
        if (filterWham)
        {
            StartTick(false, "Wham");
            if (whamWhamText)
            {
                $('.Xx.xJ:Contains("wham")').closest("[jsmodel='XNmfOc']").hide();
                //$('.Xx.xJ:contains("Wham")').closest("[jsmodel='XNmfOc']").hide();
                //$('.Xx.xJ:contains("WHAM")').closest("[jsmodel='XNmfOc']").hide();
            }
            if (whamChristmasText)
            {
                $('.Xx.xJ:Contains("Last Christmas")').closest("[jsmodel='XNmfOc']").hide();
                //$('.Xx.xJ:contains("last christmas")').closest("[jsmodel='XNmfOc']").hide();
                $('.Xx.xJ:Contains("LastChristmas")').closest("[jsmodel='XNmfOc']").hide();
                //$('.Xx.xJ:contains("lastchristmas")').closest("[jsmodel='XNmfOc']").hide();
            }
            if (whamWhamLink)
            {
                $('.yx.Nf:Contains("wham")').closest("[jsmodel='XNmfOc']").hide();
                //$('.yx.Nf:contains("Wham")').closest("[jsmodel='XNmfOc']").hide();
                //$('.yx.Nf:contains("WHAM")').closest("[jsmodel='XNmfOc']").hide();
            }
            if (whamChristmasLink)
            {
                $('.yx.Nf:Contains("Last Christmas")').closest("[jsmodel='XNmfOc']").hide();
                //$('.yx.Nf:contains("last christmas")').closest("[jsmodel='XNmfOc']").hide();
                $('.yx.Nf:Contains("LastChristmas")').closest("[jsmodel='XNmfOc']").hide();
                //$('.yx.Nf:contains("lastchristmas")').closest("[jsmodel='XNmfOc']").hide();
            }
            StoppTick(false, "Wham");
        }

        //var hinzu = "<span role=\"listitem\" class=\"g-h-f-za\" id=\":yi\" tabindex=\"-1\"><span class=\"g-h-f-za-yb\"><span class=\"g-h-f-m-wc g-h-f-m\"><div style=\"position: absolute; top: -1000px;\">Symbol Circle</div></span> <span class=\"g-h-f-za-B\">Lonely Circle</span>&nbsp;<div role=\"button\" aria-label=\"Lonely Circle entfernen\" tabindex=\"0\" class=\"g-h-f-m-bd-nb\"><span class=\"g-h-f-m g-h-f-m-bd\"></span></div></span></span>";

        if (filterCommunity)
        {
            StartTick(false, "Community");
            $('[data-iid="sii2:112"]').hide();
            $('[data-iid="sii2:116"]').hide();
            StoppTick(false, "Community");
        }
        if (filterBirthday)
        {
            StartTick(false, "Birthday");
            $('[data-iid="sii2:114"]').hide();
            StoppTick(false, "Birthday");
        }
        if (filterPersons)
        {
            StartTick(false, "Persons");
            $('[data-iid="sii2:103"]').hide();
            $('[data-iid="sii2:105"]').hide(); // Interesting Pages
            $('[data-iid="sii2:106"]').hide(); // Mopre Recommendations
            StoppTick(false, "Persons");
        }
        if (clock !== null && clock !== undefined) {
            StartTick(false, "Watch");
            PaintWatch();
            StoppTick(false, "Watch");
        }

        StartTick(false, "Hashtag-Filter");
        DOMFilterHashtags();
        StoppTick(false, "Hashtag-Filter");
        StartTick(false, "Images");
        DOMFilterImages();
        StoppTick(false, "Images");
        StartTick(false, "Fulltext");
        DOMFilterFreetext();
        StoppTick(false, "Fulltext");
        StartTick(false, "Shared Circles");
        DOMFilterSharedCircles();
        StoppTick(false, "Shared Circles");
        StartTick(false, "LSR");
        DOMMarkLSRLinks();
        StoppTick(false, "LSR");

        if (showTrophies)
        {
            StartTick(false, "Trophies");
            //OptStartTrophyDisplay();
            DrawTrophies();
            StoppTick(false, "Trophies");
            StartTick(false, "Paint Trophy Icons");
            PaintTrophyOverview();
            StoppTick(false, "Paint Trophy Icons");
        }
        if (colorUsers)
        {
            StartTick(false, "Color Users");
            PaintForUser();
            PaintColorBlock();
            StoppTick(false, "Color Users");
        }



        if (showEmoticons)
        {
            StartTick(false, "Emoticons");
            OptStartEmoticons();
            PaintEmoticons();
            StoppTick(false, "Emoticons");
        }
        StartTick(false, "Quickshare Icons");
        PaintQsIcons();
        StoppTick(false, "Quickshare Icons");
        StartTick(false, "Bookmark Icons");
        DisplayBookMarkIcons();
        StoppTick(false, "Bookmark Icons");

        WhatsHot();
    } catch (ex) {
    }
    setTimeout(function () {
        domChangeAllowed = true; // Nach x Sekunden Änderungen wieder erlauben
    }, interval);
    domChangeAllowed = false;
}



function getUrlParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) 
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] === sParam) 
        {
            return sParameterName[1];
        }
    }
}  



function ClearAllTicks() {
    if (saveTicks) {
        chrome.runtime.sendMessage({Action: "ClearTicks"});
    }
}

function StartTick(isInit, timerName) {
    if (saveTicks) {
        chrome.runtime.sendMessage({Action: "AddTick", IsInit: isInit, Name: timerName, Time: $.now()});
    }
}

function StoppTick(isInit, timerName) {
    if (saveTicks) {
        chrome.runtime.sendMessage({Action: "EndTick", IsInit: isInit, Name: timerName, Time: $.now()});
    }
}

/**
 * Filter Shared Circles
 */
function DOMFilterSharedCircles()
{
    if (filterSharedCircles) {
        try {
            $('div.ki.ve').find('div.Wy').closest("div[jsmodel='XNmfOc']").hide();
        } catch (ex) {
            console.log(ex);
        }
    }
}


/**
 * Volltextfilter
 */
function DOMFilterFreetext() {
    if (filterCustom && propsFulltext !== null && propsFulltext !== "")
    {
        try {
            var textArray = propsFulltext.split(',');
            $.each(textArray, function (i, fulltext)
            {
                $('div.Xx.xJ:Contains(' + fulltext + ')').closest("div[jsmodel='XNmfOc']").hide();
                $('div.Al.pf:Contains(' + fulltext + ')').closest("div[jsmodel='XNmfOc']").hide();
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
            $('.unhideImage').click(function () {
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

function AddMuelltonne() {
    if (filterHashTag)
        $('.zZ.a0').each(function (index, value)
        {
            if ($(this).find('a').length <= 1)
            {
                $(this).append(" <a style=\"color:red\" href=\"#\" class=\"removeHashTag\"><img title=\"" + chrome.i18n.getMessage("RemoveHashtag") + "\" src=\"" + chrome.extension.getURL('setup/images/delete.png') + "\"/></a>");
            }
        });
}

/**
 * Hashtags filtern
 */
function DOMFilterHashtags() {
    try {
        if (filterHashTag)
        {
            AddMuelltonne();
            // Einfügen von hinzufügen-Button

            if (propsHashtags !== null && propsHashtags !== "")
            {
                var hashTagArray = propsHashtags.split(',');
                $.each(hashTagArray, function (i, hashTag)
                {
                    if (hashTag.length > 1) {
                        $('.zda.Zg:Contains(' + hashTag + ')').closest("[jsmodel='XNmfOc']").hide();    // Hashtags im Beitrag
                        $('.ot-hashtag:Contains(' + hashTag + ')').closest("[jsmodel='XNmfOc']").hide();    // Hashtags in geteilten Beitrag
                        $("a[data-topicid='\/hashtag\/" + hashTag.toLowerCase() + "']").closest("[jsmodel='XNmfOc']").hide(); // Automatische Hashtags
                    }

                });
            }

        }
    } catch (ex) {
        console.log(ex);
    }
}

function AddHashtagToList(newHashtag) {
    propsHashtags += "," + newHashtag;
    chrome.runtime.sendMessage({Action: "SaveHashtags", ParameterValue: propsHashtags});


    ShowNotification("success", chrome.i18n.getMessage("HashtagFilteredTitle"), chrome.i18n.getMessage("HashtagFiltered").replace("_KEYWORD_", newHashtag));
}

function AddKeywordToList(newKeyword) {
    propsFulltext += "," + newKeyword;
    chrome.runtime.sendMessage({Action: "SaveKeywords", ParameterValue: propsFulltext});
    ShowNotification("success", chrome.i18n.getMessage("KeywordFilteredTitle"), chrome.i18n.getMessage("KeywordFiltered").replace("_KEYWORD_", newKeyword));
}

function CleanupAutosave() {
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key.indexOf("autosave.") === 0) {
            var autosaveitem = JSON.parse(localStorage.getItem(localStorage.key(i)));
            var oldDate = Date.parse(CleanDate(autosaveitem.date));
            if (oldDate < (3).days().ago()) {
                // Autosave braucht nicht tagelang im Speicher bleiben
                localStorage.removeItem(key);
            }
        }
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
            }, function (response)
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
        filterSharedCircles = response.FilterSharedCircles;
        showTrophies = response.DisplayTrophy;
        showLang = response.DisplayLang;
        showEmoticons = response.ShowEmoticons;
        lastWizardVersion = response.lastWizard;
        wizardMode = response.WizardMode;
        trophies = response.Trophies || null;
        autoSave = response.UseAutoSave;
        displayBookmarks = response.UseBookmarks;
        markLSRPosts = response.MarkLSRPosts;
        saveTicks = response.CollectTicks;
        displayQuickHashes = response.DisplayQuickHashes;



        ClearAllTicks();
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
        StartTick(true, "LSRLoad");
        LoadLsrList();
        StoppTick(true, "LSRLoad");
        StartTick(true, "Quickshare");
        LoadAllQuickSharesG();
        StoppTick(true, "Quickshare");
        StartTick(true, "Circles");
        GetAllCircles();
        StoppTick(true, "Circles");
        StartFilter(); // Initial ausführen
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


/**
 * 
 * Code von Marco Grätsch (Angepasst an Optimizer-Speicherung)
 * 
 */

