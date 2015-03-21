console.log('g+ - filter started');
this.Browser = new Browser();
var columnCount;
var imageHost = "https://files.oles-cloud.de/optimizer/";


var domainBlacklist = [];

var Subs = {
    Settings: null,
    Clock: null,
    Autosave: null,
    Bookmarks: null,
    Measure: null,
    Flags: null,
    Lsr: null,
    Quickshare: null,
    Trophy: null,
    Soccer: null,
    Emoticons: null,
    User: null,
    Weather: null
};


var forEach = Array.prototype.forEach;

var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (mutation.type === "childList") {
            forEach.call(mutation.addedNodes, function (addedNode) {
                if (addedNode.classList !== undefined) {
                    if (addedNode.classList.contains('PD')) {
                        //console.log("DOM PD:"+addedNode.classList);
                        PaintBin(addedNode);
                    } else if (addedNode.classList.contains('nja')) {
                        //console.log("DOM NJA:"+addedNode.classList);
                        FilterBlocks(addedNode);
                    } else if (addedNode.classList.contains('URaP8')) {
                        //console.log("DOM URA:"+addedNode.classList);
                        DoQuickshare(addedNode, 1);
                    }
                    //g-h-f-N-N
                    else {
                        var jsModel = addedNode.attributes["jsmodel"];
                        if (jsModel !== undefined && jsModel.value === "XNmfOc") {
                            //console.log("DOM JS:"+addedNode.classList);
                            StartFilter(addedNode);
                        } else {
                            //console.log("DOM IGNORED:"+addedNode.classList);
                        }
                    }
                }
            });
            forEach.call(mutation.removedNodes, function (removedNode) {
                if (removedNode.classList !== undefined) {
                    if (removedNode.classList.contains("YB")) {
                        // private Beiträge, Warnmeldung
                        DoQuickshare(removedNode, 1);
                    }
                }
            });

        }
    });
    ShowWidgets();
    MoveHeaderIcon();   // Evtl. Prüfen, ob man das auch an einen konkreten Dom-Change festmachen kann...
});

function StartObservation() {
    observer.observe(document, {
        childList: true,
        subtree: true,
        characterData: false,
        attributes: false
    });
}

// Case - INSensitive Contains Variant:
jQuery.expr[":"].Contains = jQuery.expr.createPseudo(function (arg) {
    return function (elem) {
        return jQuery(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
    };
});

String.prototype.replaceAll = function (str1, str2, ignore) {
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignore ? "gi" : "g")), (typeof (str2) === "string") ? str2.replace(/\$/g, "$$$$") : str2);
};

$(document).ready(function () {
    if (document.title.indexOf("Google+ Filter") !== -1)  	// Setup-Seiten
    {
        LoadSetup();
    }
    else if (window.location.href.indexOf("/communities") > 0) {
        SaveCommunities();
    }
    else if (window.location.hostname === "plus.google.com") {
        $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("setup/css/simple.css") + "' type='text/css' media='screen' />"));

        InitSettings();

        $(document).on('click', '.unhideImage', function () {
            $(this).parent().find('.hidewrapper').show();
            $(this).remove();
            return false;
        });

        $(document).on('click', '.removeHashTag', function () {
            console.log('Add Hashtag');
            if (Subs.Settings.Values.HashTags === null) {
                Subs.Settings.Values.HashTags = "";
            }
            var newHashtag = $(this).closest('.zZ').find('a')[0].innerText;
            if ((propsHashtags.indexOf(newHashtag + ",") >= 0) || propsHashtags.match(new RegExp("/" + newHashtag + "/$"))) {
                // Einmal reicht...
                return;
            }
            AddHashtagToList(newHashtag);
            $(this).hide();

            return false;
        });


    }
});
function DisplayHashtags() {

}

function SortByName(a, b) {
    var aName = a.text.toLowerCase();
    var bName = b.text.toLowerCase();
    return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
}


function GetAllCircles() {
    // Kreise auslesen
    $('script').each(function () {
        try {
            if (this.innerHTML.indexOf("AF_initDataCallback({key: '12'") > -1) {
                var newCircles = [];
                var complete = this.innerHTML;
                var startJSON = complete.indexOf('[');
                var endJSON = complete.lastIndexOf(']');
                var cstr = complete.substring(startJSON, endJSON + 1);

                while (cstr.indexOf(",,") > 0) {
                    cstr = cstr.replace(",,", ",null,");
                }

                var allCircles = $.parseJSON(cstr);
                if (allCircles.length === 1) {
                    for (i = 0; i < allCircles[0].length; i++) {
                        if (allCircles[0][i].length === 2 && allCircles[0][i][1].length === 16) {
                            var circleName = allCircles[0][i][1][0];
                            newCircles.push(circleName);
                        }
                    }
                }
                chrome.runtime.sendMessage({Action: "SaveCircles", Circles: newCircles});
            }
        } catch (ex) {
        }
    });
}


function AddHeadWrapper(parent) {
    if (parent.html().indexOf('InfoUsrTop') === -1) {
        parent.prepend("<div class='InfoUsrTop'>");
    }
}

/**
 * Wizard-Kachel zeichnen
 */
function DrawWizardTile() {
    //return;
    try {
        var wizard=new gpoWizard();


        var lang = chrome.i18n.getMessage("lang");
        wizard.CurrentLang=lang;
        if (wizard.NewWizardOptionsExist(Subs.Settings.Values.LastWizard)) {
            $.get(chrome.extension.getURL("setup/" + lang + "/wizardloader.html"), function (htmlWizard) {
                var htmlObject = $('<div/>').html(htmlWizard).contents();
                $('.Ypa.jw.am :first').prepend(htmlObject.find('[data-iid="wizard"]'));
                $('#wizardStart').click(function () {
                    $("head").append($("<link rel='stylesheet' href='" + Browser.GetExtensionFile("setup/css/bootstrap.min.css") + "' type='text/css' media='screen' />"));
                    $("head").append($("<link rel='stylesheet' href='" + Browser.GetExtensionFile("setup/css/bootstrap-switch.css") + "' type='text/css' media='screen' />"));
                    $("head").append($("<link rel='stylesheet' href='" + Browser.GetExtensionFile("setup/css/wizard.css") + "' type='text/css' media='screen' />"));
                    var wizz = $('<div id="loadhere">&nbsp;</div>');
                    $('body').prepend(wizz);
                    $('#loadhere').load(Browser.GetExtensionFile("setup/" + lang + "/wizard.html"), function () {
                        wizard.InitWizard(Subs.Settings.Values.LastWizard);
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
    Subs.Settings = new gpoSettings();
    Subs.Settings.Init();
    Subs.Settings.Load(InitGoogle);
}

function InitGoogle() {
    if (Subs.Settings.Values.Interval === null || Subs.Settings.Values.Interval < 10) {
        Subs.Settings.Values.Interval = 500;
    }
    PageLoad();

    chrome.extension.sendMessage("show_page_action");


}

function LoadGoogle() {

}
// Yp yt Xa


/**
 * Widgets zeichnen
 */
function DrawWidgets() {


    if (Subs.Weather !== null) {
        Subs.Measure.Do("weatherEnabled", function () {
            Subs.Weather.Settings = Subs.Settings.Values.WeatherWidget;
            Subs.Weather.Init();
        });
    }

    if (Subs.Soccer !== null) {
        Subs.Soccer.Settings = Subs.Settings.Values.Sport;
        Subs.Measure.Do("sportEnabled", function () {
            Subs.Soccer.Init();
        });
    }

    if (Subs.Clock !== null) {
        Subs.Measure.Do("stoppwatch", function () {
            CreateBlock(JSON.parse(Subs.Settings.Values.Stoppwatch) + 1, "clock");
            Subs.Clock.Init();
        });
    }
}

/**
 * Spalten zählen
 */
function CountColumns() {
    try {
        var $wrapper = $('.ona.Fdb');
        if ($wrapper.length > 0) {
            var columns = $wrapper.find('.Ypa.jw.am').first().nextUntil(':not(.Ypa.jw.am)').addBack().length;
            if (columns > 0) {
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
        var icondiff = 0;
        if (Subs.Settings.Values.DisplayLang) {
            icondiff += 60;
        }
        if (Subs.Settings.Values.UseBookmarks) {
            icondiff += 60;
        }
        if ($('.V9b').length > 0) {
            var oldStyle = $('.V9b').attr('style');
            if (oldStyle.indexOf("modified") === -1) {
                var oldValEnd = oldStyle.indexOf("px");
                var oldValStart = oldStyle.indexOf(" ");
                var oldVal = oldStyle.substring(oldValStart, oldValEnd);
                var oldValI = parseInt(oldVal);
                $('.V9b').attr('style', "right: " + (oldValI + icondiff) + "px; modified");
            }
        }
    }
}

function HideOnContent(parent, element) {
    if (element !== undefined && element.length > 0) {
        parent.hide();
    }
}

function SingleMeasureBool(setting, measureTitle, functionName) {
    if (setting === true) {
        Subs.Measure.Do(measureTitle, function () {
            functionName();
        });
    }
}

function SingleMeasure(setting, measureTitle, functionName) {
    if (setting !== null) {
        Subs.Measure.Do(measureTitle, function () {
            functionName();
        });
    }
}
function HideOnAttr(parent, attr, value) {
    if (parent.attr(attr) === value) {
        parent.hide();
    }
}

function SaveCommunities(changedElements) {
    // Beigetretene Communities:
    var communities = [];
    $('.UYd').find('.JUKJAb').each(function (index, value) {
        communities.push($(value).find('.ATc').text());
    });

    // Eigene Communities:
    //var communities = [];
    $('.VYd').find('.RbAFad').each(function (index, value) {
        communities.push($(value).find('.ATc').text());
    });

    chrome.runtime.sendMessage({Action: "SaveCommunities", Communities: communities});
}

function DoQuickshare(changedElements, step) {
    if (Subs.Quickshare !== null) {
        Subs.Quickshare.Events(changedElements, step);
    }
}

function FilterBlocks(changedElements) {
    var $ce = $(changedElements);
    Subs.Measure = new gpoMeasure("DOM", true);
    SingleMeasureBool(Subs.Settings.Values.Community, "Community", function () {
        HideOnAttr($ce, 'data-iid', 'sii2:112');
        HideOnAttr($ce, 'data-iid', 'sii2:116');
    });
    SingleMeasureBool(Subs.Settings.Values.Birthday, "Birthday", function () {
        HideOnAttr($ce, 'data-iid', 'sii2:114');
    });
    SingleMeasureBool(Subs.Settings.Values.Known, "Persons", function () {
        HideOnAttr($ce, 'data-iid', 'sii2:103');
        HideOnAttr($ce, 'data-iid', 'sii2:105');
        HideOnAttr($ce, 'data-iid', 'sii2:106');
    });
}

function ShowWidgets() {
    /* Widgets */
    SingleMeasure(Subs.Clock, "stoppwatch", function () {
        Subs.Clock.Dom();
    });
    SingleMeasure(Subs.Soccer, "sportEnabled", function () {
        Subs.Soccer.Dom();
    });
    SingleMeasure(Subs.Flags, "displayLang", function () {
        Subs.Flags.Dom();
    });

}

/**
 * Filteraktionen (bei jeder DOM-Änderung)
 */
function StartFilter(changedElements) {
    var $ce = $(changedElements);
    Subs.Measure = new gpoMeasure("DOM", true);

    if (Subs.Quickshare !== null) {
        Subs.Measure.Do("QuickShares", function () {
            Subs.Quickshare.Events();   // TODO: prüfen!
        });
    }

   // MoveHeaderIcon();   // Prüfen wg. Performance!

    /* WHAM */
    SingleMeasureBool(Subs.Settings.Values.Wham, "Wham", function () {
        if (Subs.Settings.Values.WHAMWhamText) {
            HideOnContent($ce, $ce.find('.Xx.xJ:Contains("wham")'));
        }
        if (Subs.Settings.Values.WHAMChristmasText) {
            HideOnContent($ce, $ce.find('.Xx.xJ:Contains("Last Christmas")'));
            HideOnContent($ce, $ce.find('.Xx.xJ:Contains("LastChristmas")'));
        }
        if (Subs.Settings.Values.WHAMWhamLink) {
            HideOnContent($ce, $ce.find('.yx.Nf:Contains("wham")'));
        }
        if (Subs.Settings.Values.WHAMChristmasLink) {
            HideOnContent($ce, $ce.find('.yx.Nf:Contains("LastChristmas")'));
            HideOnContent($ce, $ce.find('.yx.Nf:Contains("Last Christmas")'));
        }
    });

    /* Blöcke */
    SingleMeasureBool(Subs.Settings.Values.Plus1, "Plus1", function () {
        HideOnContent($ce, $ce.find('.xv'));
    });
    SingleMeasureBool(Subs.Settings.Values.Yt, "Youtube", function () {
        HideOnContent($ce, $ce.find('.SR'));
    });


    SingleMeasureBool(Subs.Settings.Values.Hashtag, "Hashtag-Filter", function () {
        DOMFilterHashtags($ce);
    });
    SingleMeasureBool((Subs.Settings.Values.FilterImages || Subs.Settings.Values.FilterLinks || Subs.Settings.Values.FilterVideo), "Images", function () {
        DOMFilterImages($ce);
    });
    SingleMeasureBool((Subs.Settings.Values.Custom && Subs.Settings.Values.Fulltext !== null && Subs.Settings.Values.Fulltext !== ""), "Fulltext", function () {
        DOMFilterFreetext($ce);
    });
    SingleMeasureBool(Subs.Settings.Values.FilterSharedCircles, "Shared Circles", function () {
        HideOnContent($ce, $ce.find('div.ki.ve').find('div.Wy'));
    });


    /* Erweiterungen */
    SingleMeasure(Subs.Lsr, "measureTitle", function () {
        Subs.Lsr.Dom($ce);
    });
    SingleMeasure(Subs.Trophy, "displayTrophy", function () {
        Subs.Trophy.Dom($ce);
    });
    SingleMeasure(Subs.User, "colorUser", function () {
        Subs.User.Dom($ce);
    });
    SingleMeasure(Subs.Emoticons, "showEmoticons", function () {
        Subs.Emoticons.Dom($ce);
    });
    SingleMeasure(Subs.Quickshare, "QuickShare", function () {
        Subs.Quickshare.Dom($ce);
    });
    SingleMeasure(Subs.Bookmarks, "useBookmarks", function () {
        Subs.Bookmarks.Dom($ce);
      //  Subs.Bookmarks.DisplayBookmarks($ce);
        Subs.Bookmarks.PaintStars($ce);
    });

}

function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] === sParam) {
            return sParameterName[1];
        }
    }
}

/**
 * Volltextfilter
 */
function DOMFilterFreetext($ce) {
    try {
        var textArray = Subs.Settings.Values.Fulltext.split(',');
        $.each(textArray, function (i, fulltext) {
            HideOnContent($ce, $ce.find('div.Xx.xJ:Contains(' + fulltext + ')'));
            HideOnContent($ce, $ce.find('div.Al.pf:Contains(' + fulltext + ')'));
        });
    } catch (ex) {
        console.log(ex);
    }
}

/**
 * Bilder, Videos und Links ausblenden
 */
function DOMFilterImages($ce) {
    try {
        $ce.find('.unhideImage').click(function () {
            $(this).parent().find('.hidewrapper').show();
            $(this).remove();
            return false;
        });

        if (Subs.Settings.Values.FilterVideo) {
            if (Subs.Settings.Values.FilterMp4Only) {
                $ce.find('.sp.ej img[src$=".mp4"]').closest('.q9.yg').not(".hidewrapper .q9.yg").wrap("<div class='hidewrapper' style=\"display:none\"></div>").closest('.yx.Nf').prepend("<a href=\"#\" class=\"unhideImage\" >" + chrome.i18n.getMessage("DisplayVideo") + "</a>");
            } else {

                $ce.find('.sp.ej.bc.Ai').closest('.q9.yg').not(".hidewrapper .q9.yg").wrap("<div class='hidewrapper' style=\"display:none\"></div>").closest('.yx.Nf').prepend("<a href=\"#\" class=\"unhideImage\" >" + chrome.i18n.getMessage("DisplayVideo") + "</a>");
            }
        }
        if (Subs.Settings.Values.FilterLinks) {
            $ce.find('.sp.ej.Mt').closest('.q9.yg').not(".hidewrapper .q9.yg").wrap("<div class='hidewrapper' style=\"display:none\"></div>").closest('.yx.Nf').prepend("<a href=\"#\" class=\"unhideImage\" >" + chrome.i18n.getMessage("DisplayLink") + "</a>");
            $ce.find('.sp.ej.A8Hhid').closest('.q9.yg').not(".hidewrapper .q9.yg").wrap("<div class='hidewrapper' style=\"display:none\"></div>").closest('.yx.Nf').prepend("<a href=\"#\" class=\"unhideImage\" >" + chrome.i18n.getMessage("DisplayLink") + "</a>");
        }
        if (Subs.Settings.Values.FilterImages) {
            if (Subs.Settings.Values.FilterGifOnly) {
                $ce.find('.d-s.ob.Ks img[src$=".gif"]').closest('.q9.yg').not(".hidewrapper .q9.yg").wrap("<div class='hidewrapper' style=\"display:none\"></div>").closest('.yx.Nf').prepend("<a href=\"#\" class=\"unhideImage\" >" + chrome.i18n.getMessage("DisplayImage") + "</a>");
                $ce.find('.d-s.ob.Ks img[src$=".GIF"]').closest('.q9.yg').not(".hidewrapper .q9.yg").wrap("<div class='hidewrapper' style=\"display:none\"></div>").closest('.yx.Nf').prepend("<a href=\"#\" class=\"unhideImage\" >" + chrome.i18n.getMessage("DisplayImage") + "</a>");
            } else {
                $ce.find('.d-s.ob.Ks').closest('.q9.yg').not(".hidewrapper .q9.yg").wrap("<div class='hidewrapper' style=\"display:none\"></div>").closest('.yx.Nf').prepend("<a href=\"#\" class=\"unhideImage\" >" + chrome.i18n.getMessage("DisplayImage") + "</a>");
            }
        }

    }
    catch (ex) {
        console.log(ex);
    }
}

function PaintBin(ce) {
    $(ce).find('.zZ.a0').each(function (index, value) {
        if ($(this).find('a').length <= 1) {
            $(this).append(" <a style=\"color:red\" href=\"#\" class=\"removeHashTag\"><img title=\"" + chrome.i18n.getMessage("RemoveHashtag") + "\" src=\"" + chrome.extension.getURL('setup/images/delete.png') + "\"/></a>");
        }
    });
}

/**
 * Hashtags filtern
 */
function DOMFilterHashtags($ce) {
    try {
        // Einfügen von hinzufügen-Button
        if (Subs.Settings.Values.HashTags !== null && Subs.Settings.Values.HashTags !== "") {
            var hashTagArray = Subs.Settings.Values.HashTags.split(',');
            $.each(hashTagArray, function (i, hashTag) {
                if (hashTag.length > 1) {
                    HideOnContent($ce, $ce.find('.zda.Zg:Contains(' + hashTag + ')'));
                    HideOnContent($ce, $ce.find('.ot-hashtag:Contains(' + hashTag + ')'));
                    HideOnContent($ce, $ce.find("a[data-topicid='\/hashtag\/" + hashTag.toLowerCase() + "']"));
                }
            });
        }
    } catch (ex) {
        console.log(ex);
    }
}

function AddHashtagToList(newHashtag) {
    Subs.Settings.Values.HashTags += "," + newHashtag;
    Subs.Settings.Save("HashTags", Subs.Settings.Values.HashTags);

    ShowNotification("success", chrome.i18n.getMessage("HashtagFilteredTitle"), chrome.i18n.getMessage("HashtagFiltered").replace("_KEYWORD_", newHashtag));
}

function InitObject(condition, object) {
    if (condition) {
        return new object;
    }
    return null;
}


function InitObjects() {
    Subs.Bookmarks = InitObject(Subs.Settings.Values.UseBookmarks, gpoBookmarks);
    Subs.Autosave = InitObject(Subs.Settings.Values.UseAutoSave, gpoAutosave);
    Subs.Flags = InitObject(Subs.Settings.Values.DisplayLang, gpoFlags);
    Subs.Lsr = InitObject(Subs.Settings.Values.MarkLSRPosts, gpoLsr);
    Subs.Trophy = InitObject(Subs.Settings.Values.DisplayTrophy, gpoTrophy);
    Subs.Soccer = InitObject(Subs.Settings.Values.SportEnabled, gpoSport);
    Subs.Clock = InitObject(Subs.Settings.Values.Stoppwatch, gpoClock);
    Subs.Emoticons = InitObject(Subs.Settings.Values.ShowEmoticons, gpoEmoticons);
    Subs.User = InitObject(Subs.Settings.Values.ColorUsers, gpoUser);
    if (Subs.User !== null) {
        Subs.User.AllUserSettings = Subs.Settings.Values.UserCols;
    }
    var weatherSettings = Subs.Settings.Values.WeatherWidget;
    if (weatherSettings !== undefined && weatherSettings !== null) {
        //weatherSettings=JSON.parse(weatherSettings);
        Subs.Weather = InitObject(weatherSettings.Enabled, gpoWeather);
        gpoWeather.Settings = weatherSettings;
    }

    //Subs.Weather=InitObject(Subs.Settings.Values.WeatherEnabled,gpoWeather);    

    var qs = Subs.Settings.Values.QuickShares;
    var qsEnabled = Subs.Settings.Values.EnableQs;
    Subs.Quickshare = InitObject((qsEnabled && qs !== null && qs.length > 0), gpoQuickShare);
    if (Subs.Quickshare !== null) {
        Subs.Quickshare.Shares = qs;
    }

    if ($('.gb_ua').length>0) {
        chrome.runtime.sendMessage({Action: "SaveUserName", ParameterValue: $('.gb_ua').text()});
    }
    StartObservation();
}

function PageLoad() {
    InitObjects();




        Subs.Measure = new gpoMeasure("START", true);

        var wizard = JSON.parse(Subs.Settings.Values.WizardMode);


        SingleMeasureBool(wizard >= 0, "wizard", function () {
            DrawWizardTile();
        });

        SingleMeasure(Subs.Bookmarks, "useBookmarks", function () {
            Subs.Bookmarks.Init();
        });

        SingleMeasure(Subs.Autosave, "useAutoSave", function () {
            Subs.Autosave.CleanupAutosave();
            Subs.Autosave.Init();
        });

        SingleMeasure(Subs.User, "colorUser", function () {
            Subs.User.Init();
        });

        SingleMeasure(Subs.Trophy, "displayTrophy", function () {
            Subs.Trophy.Init();
        });

        SingleMeasureBool(Subs.Settings.Values.DisplayQuickHashes, "displayQuickHashes", function () {
         //   $('#contentPane').parent().prepend('<div id="quickht">Quick-Hashtags:<br/></div>');
        });

        SingleMeasure(Subs.Lsr, "markLSRPosts", function () {
            Subs.Lsr.Init();
        });

        SingleMeasure(Subs.Quickshare, "QuickShares", function () {
            Subs.Quickshare.Init();
        });

        GetAllCircles();
        DrawWidgets();
        CountColumns();

        // TODO: Dies ist nur ein WORKAROUND! Warum der MutationObserver da nicht immer will, ist noch zu prüfen!
    TripleInit();



    console.log('G+Filter: Google+ - Filter initialisiert');
}

function TripleInit() {
    // Initial Mutation Observer simulieren:
    $('[jsmodel="XNmfOc"]').each(function (index, value) {
        StartFilter(value);
    });
    $('.nja').each(function (index, value) {
        FilterBlocks(value);
    });
}

/**
 * Widget-Block zeichne
 * @param {int} position position der Spalte
 * @param {string} id Id des Blocks
 */
function CreateBlock(position, id) {
    var wrapper = "<div  tabindex=\"-1\" class=\"nja\" id=\"" + id + "\"></div>";
    if (position === 1) {
        $('[data-iid="sii2:111"]').append(wrapper);
    } else {

        $(".ona.Fdb .Ypa:nth-child(" + position + ")").prepend(wrapper);
    }
}

/**
 * Meldung anzeigen
 * @param {string} notificationType Art der Meldung
 * @param {string} title Titel
 * @param {string} text Text
 */
function ShowNotification(notificationType, title, text) {
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
function ClearNotification() {
    $("#gplusMessage").remove();
}

