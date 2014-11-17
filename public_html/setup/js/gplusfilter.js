console.log('g+ - filter started');

var columnCount;

var domChangeAllowed = true;

var domainBlacklist = [];

var Subs={
    Settings:null,
    Clock:null,
    Autosave:null,
    Bookmarks:null,
    Measure:null,
    Flags:null,
    Lsr:null,
    Quickshare:null,
    Trophy:null
};

function IsDemo() {
    return  document.location.search.indexOf("demoMode") > 0;
}

// Case - INSensitive Contains Variant:
jQuery.expr[":"].Contains = jQuery.expr.createPseudo(function (arg) {
    return function (elem) {
        return jQuery(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
    };
});

function AllowDomChange() {
    setTimeout(function () {
        domChangeAllowed = true; // Nach x Sekunden Änderungen wieder erlauben
    }, Subs.Settings.Values.Interval);
}

$(document).ready(function ()
{
    if (document.title.indexOf("Google+ Filter") !== -1)  	// Setup-Seiten
    {
        LoadSetup();
    }
    else if (window.location.hostname === "plus.google.com")
    {
        $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("setup/css/simple.css") + "' type='text/css' media='screen' />"));
       
        InitSettings();

        $(document).on('click', '.unhideImage', function ()
        {
            $(this).parent().find('.hidewrapper').show();
            $(this).remove();
            return false;
        });

        $(document).on('click', '.removeHashTag', function ()
        {
            console.log('Add Hashtag');
            if (Subs.Settings.Values.HashTags === null)
            {
                Subs.Settings.Values.HashTags = "";
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
    if (Subs.Settings.Values.DisplayQuickHashes) {

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
    if (Subs.Settings.Values.DisplayQuickHashes ) {
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
        if (NewWizardOptionsExist(Subs.Settings.Values.LastWizard)) {
            $.get(chrome.extension.getURL("setup/" + lang + "/wizardloader.html"), function (htmlWizard) {
                var htmlObject = $('<div/>').html(htmlWizard).contents();
                $('.Ypa.jw.am :first').prepend(htmlObject.find('[data-iid="wizard"]'));
                $('#wizardStart').click(function () {
                    $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("setup/css/bootstrap-switch.css") + "' type='text/css' media='screen' />"));
                    $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("setup/css/wizard.css") + "' type='text/css' media='screen' />"));
                    var wizz = $('<div id="loadhere">&nbsp;</div>');
                    $('body').prepend(wizz);
                    $('#loadhere').load(chrome.extension.getURL("setup/" + lang + "/wizard.html"), function () {
                        InitWizard(Subs.Settings.Values.LastWizard);
                        console.log('Wizard loaded');
                    });
                });
            });
        }
    } catch (ex) {
        console.log(ex);
    }
}

function InitSettings() {
    Subs.Settings=new gpoSettings();
    Subs.Settings.Init();
    Subs.Settings.Load(InitGoogle);
}

function InitGoogle() {
    if (Subs.Settings.Values.Interval === null || Subs.Settings.Values.Interval< 10)
    {
        Subs.Settings.Values.Interval = 500;
    }
    PageLoad();
    chrome.extension.sendMessage("show_page_action");
}

function LoadGoogle() {
    var timeout = null;
    document.addEventListener("DOMSubtreeModified", function ()
    {
        // Beim Nachladen der Seite neu aktiv werden
        if (timeout)
        {
            clearTimeout(timeout);
        }
        timeout = setTimeout(StartFilter, Subs.Settings.Values.Interval); // Ajax request (Scrollen: Alle halbe Sekunde checken)    
    }, false);
}

/**
 * Widgets zeichnen
 */
function DrawWidgets() {
    try {
        // Wetter checken:
        if (Subs.Settings.Values.Weather !== null )
        {
            $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("./setup/css/weather.css") + "' type='text/css' media='screen' />"));
            OptStartWeather();
            StartWeather();
        }

       /* if (soccer !== null && soccer !== undefined)
        {
            $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("./setup/css/sport.css") + "' type='text/css' media='screen' />"));
            OptStartSoccer();
            StartSoccer();
        }*/

        if (Subs.Settings.Values.StoppWatch !== null && Subs.Settings.Values.StoppWatch!== undefined)
        {
            CreateBlock(JSON.parse(Subs.Settings.Values.StoppWatch) + 1, "clock");
            Subs.Clock=new gpoClock();
            Subs.Clock.Init();
        }
    } catch (ex) {
        console.log(ex);
    }
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
     if (Subs.Settings.Values.UseBookmarks || Subs.Settings.Values.DisplayLang) {
        var icondiff=0;
        if (Subs.Settings.Values.DisplayLang) {
            icondiff+=60;
        }
        if (Subs.Settings.Values.UseBookmarks) {
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
function StartFilter() {

    if (Subs.Quickshare!==null) {
        Subs.Measure.Do("QuickShares",function() {
            Subs.Quickshare.Events();
        });
    }
    
    MoveHeaderIcon();

    if (!domChangeAllowed) {
        // Es wird bereits eine Anpassung durchgeführt
        return;
    }
  
    Subs.Measure=new gpoMeasure("DOM", true);


    StartTick(false, "Hashtags");
    LoadHashTags();
    StoppTick(false, "Hashtags");
    StartTick(false, "Hashtag-Delete");
    AddMuelltonne();
    StoppTick(false, "Hashtag-Delete");

    if (Subs.Settings.Values.Plus)
    {
        StartTick(false, "Plus1");
        $('.xv').closest("[jsmodel='XNmfOc']").hide();
        StoppTick(false, "Plus1");
    }
    if (Subs.Settings.Values.Yt)
    {
        StartTick(false, "Youtube");
        $('.SR').closest("[jsmodel='XNmfOc']").hide();
        StoppTick(false, "Youtube");
    }
    if (Subs.Settings.Values.Wham);
    {
        StartTick(false, "Wham");
        if (Subs.Settings.Values.WhamWhamText)
        {
            $('.Xx.xJ:Contains("wham")').closest("[jsmodel='XNmfOc']").hide();
            //$('.Xx.xJ:contains("Wham")').closest("[jsmodel='XNmfOc']").hide();
            //$('.Xx.xJ:contains("WHAM")').closest("[jsmodel='XNmfOc']").hide();
        }
        if (Subs.Settings.Values.WhamChristmasText)
        {
            $('.Xx.xJ:Contains("Last Christmas")').closest("[jsmodel='XNmfOc']").hide();
            //$('.Xx.xJ:contains("last christmas")').closest("[jsmodel='XNmfOc']").hide();
            $('.Xx.xJ:Contains("LastChristmas")').closest("[jsmodel='XNmfOc']").hide();
            //$('.Xx.xJ:contains("lastchristmas")').closest("[jsmodel='XNmfOc']").hide();
        }
        if (Subs.Settings.Values.WhamWhamLink)
        {
            $('.yx.Nf:Contains("wham")').closest("[jsmodel='XNmfOc']").hide();
            //$('.yx.Nf:contains("Wham")').closest("[jsmodel='XNmfOc']").hide();
            //$('.yx.Nf:contains("WHAM")').closest("[jsmodel='XNmfOc']").hide();
        }
        if (Subs.Settings.Values.WhamChristmasLink)
        {
            $('.yx.Nf:Contains("Last Christmas")').closest("[jsmodel='XNmfOc']").hide();
            //$('.yx.Nf:contains("last christmas")').closest("[jsmodel='XNmfOc']").hide();
            $('.yx.Nf:Contains("LastChristmas")').closest("[jsmodel='XNmfOc']").hide();
            //$('.yx.Nf:contains("lastchristmas")').closest("[jsmodel='XNmfOc']").hide();
        }
        StoppTick(false, "Wham");
    }

    //var hinzu = "<span role=\"listitem\" class=\"g-h-f-za\" id=\":yi\" tabindex=\"-1\"><span class=\"g-h-f-za-yb\"><span class=\"g-h-f-m-wc g-h-f-m\"><div style=\"position: absolute; top: -1000px;\">Symbol Circle</div></span> <span class=\"g-h-f-za-B\">Lonely Circle</span>&nbsp;<div role=\"button\" aria-label=\"Lonely Circle entfernen\" tabindex=\"0\" class=\"g-h-f-m-bd-nb\"><span class=\"g-h-f-m g-h-f-m-bd\"></span></div></span></span>";

    if (Subs.Settings.Values.Community)
    {
        StartTick(false, "Community");
        $('[data-iid="sii2:112"]').hide();
        $('[data-iid="sii2:116"]').hide();
        StoppTick(false, "Community");
    }
    if (Subs.Settings.Values.Birthday)
    {
        StartTick(false, "Birthday");
        $('[data-iid="sii2:114"]').hide();
        StoppTick(false, "Birthday");
    }
    if (Subs.Settings.Values.Known)
    {
        StartTick(false, "Persons");
        $('[data-iid="sii2:103"]').hide();
        $('[data-iid="sii2:105"]').hide(); // Interesting Pages
        $('[data-iid="sii2:106"]').hide(); // Mopre Recommendations
        StoppTick(false, "Persons");
    }
    if (Subs.Settings.Values.StoppWatch !== null && Subs.Settings.Values.StoppWatch !== undefined) {

        StartTick(false, "Watch");
        Subs.Clock.PaintWatch();
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
    
    if (Subs.Lsr!==null) {
         Subs.Measure.Do("markLSRPosts",function() {
             Subs.Lsr.Dom();
         });
    }

    if (Subs.Trophy!==null) {
        Subs.Measure.Do("displayTrophy",function() {
            Subs.Trophy.Dom();
        });
        
    }
    if (Subs.Settings.Values.ColorUsers)
    {
        StartTick(false, "Color Users");
        PaintForUser();
        PaintColorBlock();
        StoppTick(false, "Color Users");
    }



    if (Subs.Settings.Values.ShowEmoticons)
    {
        StartTick(false, "Emoticons");
        OptStartEmoticons();
        PaintEmoticons();
        StoppTick(false, "Emoticons");
    }
    
    if (Subs.Quickshare!==null) {
        Subs.Measure.Do("QuickShare",function() {
            Subs.Quickshare.Dom();
        });
    }
    
    if (Subs.Bookmarks!==null) {
         Subs.Measure.Do("useBookmarks",function() {
             Subs.Bookmarks.Dom();
            Subs.Bookmarks.DisplayBookmarks();
            Subs.Bookmarks.PaintStars();
        });
    }
    
    StoppTick(false, "Bookmark Icons");

    if (Subs.Flags!==null) {
        Subs.Measure.Do("displayLang",function() {
            Subs.Flags.Dom();
        });
    }
   
    AllowDomChange();
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
    if (Subs.Settings.Values.CollectTicks) {
        chrome.runtime.sendMessage({Action: "ClearTicks"});
    }
}

function StartTick(isInit, timerName) {
    if (Subs.Settings.Values.CollectTicks) {
        chrome.runtime.sendMessage({Action: "AddTick", IsInit: isInit, Name: timerName, Time: $.now()});
    }
}

function StoppTick(isInit, timerName) {
    if (Subs.Settings.Values.CollectTicks) {
        chrome.runtime.sendMessage({Action: "EndTick", IsInit: isInit, Name: timerName, Time: $.now()});
    }
}

/**
 * Filter Shared Circles
 */
function DOMFilterSharedCircles()
{
    if (Subs.Settings.Values.FilterSharedCircles) {
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
    if (Subs.Settings.Values.Custom && Subs.Settings.Values.Fulltext !== null && Subs.Settings.Values.Fulltext !== "")
    {
        try {
            var textArray = Subs.Settings.Values.Fulltext.split(',');
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
        if (Subs.Settings.Values.FilterImages || Subs.Settings.Values.FilterLinks || Subs.Settings.Values.FilterVideo)
        {
            $('.unhideImage').click(function () {
                $(this).parent().find('.hidewrapper').show();
                $(this).remove();
                return false;
            });
        }

        if (Subs.Settings.Values.FilterVideo)
        {
            if (Subs.Settings.Values.FilterMp4Only) {
                $('.sp.ej img[src$=".mp4"]').closest('.q9.yg').not(".hidewrapper .q9.yg").wrap("<div class='hidewrapper' style=\"display:none\"></div>").closest('.yx.Nf').prepend("<a href=\"#\" class=\"unhideImage\" >" + chrome.i18n.getMessage("DisplayVideo") + "</a>");
            } else {

                $('.sp.ej.bc.Ai').closest('.q9.yg').not(".hidewrapper .q9.yg").wrap("<div class='hidewrapper' style=\"display:none\"></div>").closest('.yx.Nf').prepend("<a href=\"#\" class=\"unhideImage\" >" + chrome.i18n.getMessage("DisplayVideo") + "</a>");
            }
        }
        if (Subs.Settings.Values.FilterLinks)
        {
            $('.sp.ej.Mt').closest('.q9.yg').not(".hidewrapper .q9.yg").wrap("<div class='hidewrapper' style=\"display:none\"></div>").closest('.yx.Nf').prepend("<a href=\"#\" class=\"unhideImage\" >" + chrome.i18n.getMessage("DisplayLink") + "</a>");
            $('.sp.ej.A8Hhid').closest('.q9.yg').not(".hidewrapper .q9.yg").wrap("<div class='hidewrapper' style=\"display:none\"></div>").closest('.yx.Nf').prepend("<a href=\"#\" class=\"unhideImage\" >" + chrome.i18n.getMessage("DisplayLink") + "</a>");
        }
        if (Subs.Settings.Values.FilterImages)
        {
            if (Subs.Settings.Values.FilterGifOnly)
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
    if (Subs.Settings.Values.Hashtag)
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
        if (Subs.Settings.Values.Hashtag)
        {
            AddMuelltonne();
            // Einfügen von hinzufügen-Button

            if (Subs.Settings.Values.HashTags !== null && Subs.Settings.Values.HashTags !== "")
            {
                var hashTagArray = Subs.Settings.Values.HashTags.split(',');
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
    Subs.Settings.Values.HashTags += "," + newHashtag;
    Subs.Settings.Save("HashTags",Subs.Settings.Values.HashTags);

    ShowNotification("success", chrome.i18n.getMessage("HashtagFilteredTitle"), chrome.i18n.getMessage("HashtagFiltered").replace("_KEYWORD_", newHashtag));
}

function InitObject(condition,  object) {
    if (condition) {
        return new object;
    }
    return null;
}



function InitObjects() {
    Subs.Bookmarks=InitObject(Subs.Settings.Values.UseBookmarks,gpoBookmarks);
    Subs.Autosave=InitObject(Subs.Settings.Values.UseAutoSave,gpoAutosave);
    Subs.Flags=InitObject(Subs.Settings.Values.DisplayLang,gpoFlags);
    Subs.Lsr=InitObject(Subs.Settings.Values.MarkLSRPosts,gpoLsr);
    Subs.Trophy=InitObject(Subs.Settings.Values.DisplayTrophy,gpoTrophy)
    var qs=Subs.Settings.Values.QuickShares;
    Subs.Quickshare=InitObject((qs!==null && qs.length>0),gpoQuickShare);
    Subs.Quickshare.Shares=qs;
    

}

function PageLoad() {
        console.log('G+Filter: Google+ - Filter initialisiert');
        InitObjects();
        
        Subs.Measure=new gpoMeasure("START", true);
        
        var wizard=JSON.parse(Subs.Settings.Values.WizardMode);
        if (wizard >= 0)
        {
            Subs.Measure.Do("wizard",function() {
                DrawWizardTile();
            });
        }
            
        if (Subs.Bookmarks!==null) {
            Subs.Measure.Do("useBookmarks",function() {
                Subs.Bookmarks.Init();
            });
        }
        if (Subs.Autosave!==null) {
            Subs.Measure.Do("useAutoSave",function() {
                Subs.Autosave.CleanupAutosave();
                Subs.Autosave.Init();
            });
        }
        
        if (Subs.Settings.Values.ColorUsers)
        {
            Subs.Measure.Do("ColorUsers",function() {
                OptStartColors();
            });
        }
        
        if (Subs.Trophy!==null) {
            Subs.Measure.Do("displayTrophy",function() {
                Subs.Trophy.Init();
            });
        }

        DisplayHashtags();
        
         if (Subs.Lsr!==null) {
            Subs.Measure.Do("markLSRPosts",function() {
                Subs.Lsr.Init();
            });
        }
        
        if (Subs.Quickshare!==null) {
            Subs.Measure.Do("QuickShares",function() {
                Subs.Quickshare.Init();
            });
        }
        
        GetAllCircles();
        DrawWidgets();
        StartFilter(); // Initial ausführen
        
        LoadGoogle();
        CountColumns();
    
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

