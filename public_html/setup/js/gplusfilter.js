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

if (document.title.indexOf("Google+") !== -1)
{
    InitGoogle();
}

$(document).ready(function()
{
    if (document.title.indexOf("Google+ Filter") !== -1)  	// Setup-Seiten
    {
        LoadSetup();
    }
    else if (document.title.indexOf("Google+") !== -1)
    {
        LoadGoogle();
        CountColumns();
    }
});


// Initiale Aktionen beim Laden der G+-Seite:
function InitGoogle()
{
    // TODO: Backgroundscript!
    var interval = JSON.parse(localStorage.getItem("interval"));
    if (interval === null || interval < 10)
    {
        interval = 500;
    }
    LoadSettingsLive();

    chrome.extension.sendMessage("show_page_action");
}

//var changingTheDomMyself=false;

// Google-Aktionen, wenn DOM bereit
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

    // Wetter checken:
    if (wetter !== null && wetter !== undefined)
    {
        // Mindestens ein Wetter-Widget ausgewählt
        $.getScript(chrome.extension.getURL("./setup/js/weather.js"), function() {
            $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("./setup/css/weather.css") + "' type='text/css' media='screen' />"));
            StartWeather();
            console.log("weather loaded.");
        });

    }

    if (soccer !== null && soccer !== undefined)
    {
        $.getScript(chrome.extension.getURL("./setup/js/fussball.js"), function() {
            $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("./setup/css/sport.css") + "' type='text/css' media='screen' />"));
            StartSoccer();
            console.log("fuss loaded.");
        });
    }

    $.getScript(chrome.extension.getURL("./setup/js/user.js"), function() {
        $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("./setup/css/user.css") + "' type='text/css' media='screen' />"));
        allCssColors = GetCssColors();
        if (1)  // Bedingung UserPaint
        {
            GetAllUserSettings();


        }
        console.log("colorblock loaded.");
    });

    if (clock !== null && clock !== undefined)
    {
        $.when(
                $.getScript(chrome.extension.getURL("./setup/js/jquery-1.10.2.min.js")),
                $.getScript(chrome.extension.getURL("./setup/js/clock.js")),
                $.Deferred(function(deferred) {
                    $(deferred.resolve);
                })
                ).done(function()
        {
            $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("./setup/css/clock.css") + "' type='text/css' media='screen' />"));
            CreateBlock(JSON.parse(clock) + 1, "clock");
            InitTimer();
            // StartTimer(clock);
            console.log("clock loaded.");
            //place your code here, the scripts are all loaded
        });
    }
}
var allCssColors;

var allUserSettingsFromBackground;

/**
 * Sämtliche Usereinstellungen auslesen
 * @returns {userEinstellungen}
 */
function GetAllUserSettings()
{

    chrome.runtime.sendMessage(
            {
                Action: "LoadUsers"
            }, function(response)
    {
        allUserSettingsFromBackground = JSON.parse(response.AllUserSettings);
    }
    );
}

function hexToR(h) {
    return parseInt((cutHex(h)).substring(0, 2), 16);
}
function hexToG(h) {
    return parseInt((cutHex(h)).substring(2, 4), 16);
}
function hexToB(h) {
    return parseInt((cutHex(h)).substring(4, 6), 16);
}
function cutHex(h) {
    return (h.charAt(0) === "#") ? h.substring(1, 7) : h;
}

function hexToRGB(hex)
{
    var r = hexToR(hex);
    var g = hexToG(hex);
    var b = hexToB(hex);
    return [r, g, b];
}

function GetCssColors()
{
    var colors = [];
    colors.push(AddToCssColor("76a7fa", "Mqc"));
    colors.push(AddToCssColor("fbcb43", "Jqc"));
    colors.push(AddToCssColor("e46f61", "WRa"));
    colors.push(AddToCssColor("4dbfd9", "Tqc"));
    colors.push(AddToCssColor("8cc474", "Hqc"));
    colors.push(AddToCssColor("bc5679", "CVb"));
    return colors;
}

function CountColumns()
{
    var $wrapper = $('.ona.Fdb.bsa');
    if ($wrapper.length > 0)
    {
        var columns = $wrapper.find('.Ypa.jw.Yc.am').first().nextUntil(':not(.Ypa.jw.Yc.am)').addBack().length;
        if (columns > 0)
        {
            chrome.runtime.sendMessage(
                    {
                        Action: "SaveColumns", ParameterValue: columns}, function(response) {
            }
            );
        }
    }
}

function AddToCssColor(name, cssclass)
{
    var col = hexToRGB(name);

    var colorData = new Object();
    colorData.Name = name;
    colorData.Color = "rgb(" + col[0] + ", " + col[1] + ", " + col[2] + ")";
    colorData.CssClass = cssclass;
    return colorData;
}

// Filter-Aktionen
function StartFilter()
{
    if (filterPlus1)
    {
        $('.xv').closest("[role='article']").hide();
    }
    if (filterYouTube)
    {
        $('.SR').closest("[role='article']").hide();
    }
    if (filterWham)
    {
        if (whamWhamText)
        {
            $('.Xx.xJ:contains("wham")').closest("[role='article']").hide();
            $('.Xx.xJ:contains("Wham")').closest("[role='article']").hide();
            $('.Xx.xJ:contains("WHAM")').closest("[role='article']").hide();
        }
        if (whamChristmasText)
        {
            $('.Xx.xJ:contains("Last Christmas")').closest("[role='article']").hide();
            $('.Xx.xJ:contains("last christmas")').closest("[role='article']").hide();
            $('.Xx.xJ:contains("LastChristmas")').closest("[role='article']").hide();
            $('.Xx.xJ:contains("lastchristmas")').closest("[role='article']").hide();
        }
        if (whamWhamLink)
        {
            $('.yx.Nf:contains("wham")').closest("[role='article']").hide();
            $('.yx.Nf:contains("Wham")').closest("[role='article']").hide();
            $('.yx.Nf:contains("WHAM")').closest("[role='article']").hide();
        }
        if (whamChristmasLink)
        {
            $('.yx.Nf:contains("Last Christmas")').closest("[role='article']").hide();
            $('.yx.Nf:contains("last christmas")').closest("[role='article']").hide();
            $('.yx.Nf:contains("LastChristmas")').closest("[role='article']").hide();
            $('.yx.Nf:contains("lastchristmas")').closest("[role='article']").hide();
        }
    }
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
                    $('.zda.Zg:contains(' + hashTag + ')').closest("[role='article']").hide();
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
            chrome.runtime.sendMessage(
                    {
                        Action: "SaveHashtags", ParameterValue: propsHashtags
                    }, function(response) {
            }
            );
            $(this).hide();
            ShowNotification("success", "Hashtag wurde zum Filter hinzugefügt.", " Du wirst die nächste Zeit nichts mehr von " + newHashtag + " hören. Bitte Seite neu laden, um den Filter zu aktivieren.");
            return false;
        });
    }

    if (filterImages || filterLinks || filterVideo)
    {
        $('.unhideImage').click(function() {
            $(this).parent().find('.hidewrapper').show();

            $(this).remove();
            return false;
        }
        );
    }
    if (filterImages && filterLinks && filterVideo && !filterGifOnly)
    {
        // Alles filtern
        $('.q9.yg').not(".hidewrapper .q9.yg").wrap("<div class='hidewrapper' style=\"display:none\"></div>").closest('.yx.Nf').prepend("<a href=\"#\" class=\"unhideImage\" >" + chrome.i18n.getMessage("DisplayContent") + "</a>");
    } else
    {
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

    if (filterCustom && propsFulltext !== null && propsFulltext !== "")
    {
        var textArray = propsFulltext.split(',');
        $.each(textArray, function(i, fulltext)
        {
            $('.Xx.xJ:contains(' + fulltext + ')').closest("[role='article']").hide();
        });
    }
    if (colorUsers)
    {
        PaintForUser();
        PaintColorBlock();
    }
}

// Einstellungen Laden
function LoadSettingsLive()
{
    GetSettingsFromBackground();
    anyFilterEnabled = filterPlus1 || filterYouTube || filterWham || filterHashTag || filterCustom || filterCommunity || filterBirthday || filterPersons;
    if (anyFilterEnabled)
    {
        console.log('G+Filter: Filter aktiv');
    } else {
        console.log('G+Filter: KEIN Filter aktiv!');
    }
}

// Einstellungen von filter.js holen
function GetSettingsFromBackground()
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
        filterGifOnly=response.FilterGifOnly;
        filterMp4Only=response.FilterMp4Only;
        
    }
    );
}

// Beliebigen Block erzeugen
function CreateBlock(position, id)
{
    var wrapper = "<div  tabindex=\"-1\" class=\"nja\" id=\"" + id + "\"></div>";
    if (position === 1)
    {
        $('[data-iid="sii2:111"]').append(wrapper);
    } else
    {
        $(".ona.Fdb.bsa .Ypa:nth-child(" + position + ")").prepend(wrapper);
    }
}


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




    var messageBox = "<div id='gplusMessage' style=\"" + style + "\"><b>" + title + ":</b>" + text + "</div>";
    $('.Ima.Xic').append(messageBox);
    $('#gplusMessage').click(function() {
        ClearNotification();
    });
    timeout = setTimeout(ClearNotification, 10000);
}

function ClearNotification()
{
    $("#gplusMessage").remove();
}


