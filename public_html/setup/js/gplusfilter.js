var loaded=false;

this.Browser = new Browser();
this.Log=new gpoLog();
this.Log.Init();
var imageHost = "https://files.oles-cloud.de/optimizer/";


var Subs = {
    Settings: null,
    Clock: null,
    Bookmarks: null,
    Measure: null,
    Flags: null,
    Domain: null,
    Trophy: null,
    Soccer: null,
    Emoticons: null,
    User: null,
    Weather: null
};

/** Hilfsfunktionen: **/
function CleanDate(anyDate) {
    if (anyDate.indexOf("(") > 0) {
        return anyDate.substring(0, anyDate.indexOf("(") - 1);
    }
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


function SortByName(a, b) {
    var aName = a.text.toLowerCase();
    var bName = b.text.toLowerCase();
    return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
}

function AddHeadWrapper(parent) {
    if (parent.html().indexOf('InfoUsrTop') === -1) {
        parent.prepend("<div class='InfoUsrTop'>");
    }
}

var oldUrl=window.location.href;
var forEach = Array.prototype.forEach;

function DomCheckArticle(element) {
    if (element.nodeName == "C-WIZ") {
        if (element.attributes) {
            var jsModel = element.attributes["jsmodel"];
            if (jsModel) {
                if (jsModel.value.indexOf("iMhCXb") > 0) { // Neuer Artikelblock
                    StartFilter(element);
                }
            }
        }
    }
}

function DomCheckNavigation(element) {
    // Seite wurde neu geladen durch Navigation links, oder klick auf Name, oder...
    if (element.nodeName == "C-WIZ") {
        if (!element.classList || element.classList.length==0) {
            $(element).find('li').each(function(i,li) {
                DomCheckComment(li);
            }    );
        } else {
            if (Array.from(element.classList).indexOf("cla0ib") < 0) return;
            RestartFilter();
        }
    }
}

function DomCheckBlock(element) {
    if (element.nodeName == "DIV") {
        var dataiid = element.attributes["data-iid"];
        if (dataiid) {
            if (dataiid.value.length < 5) { // Neuer Artikelblock
                FilterBlocks(element);
            }
        }
    }
}

function DomCheckComment(element) {
    if (element.nodeName=="LI") {
        if (!element.classList) return;
        if (Array.from(element.classList).indexOf("BCNiN")<0) return;
        SingleMeasure(Subs.Domain, "domain", function () {
            Subs.Domain.Dom($(element));
        });
    }

}

var cwizObserver= new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (oldUrl!==window.location.href) {
            RestartFilter();    // Neue Seite aufgerufen, z.B. "Angesagte Beiträge", Person, Community
        }
        oldUrl=window.location.href;
        if (mutation.type === "childList") {
            forEach.call(mutation.addedNodes, function (addedNode) {
                DomCheckArticle(addedNode);
                DomCheckBlock(addedNode);
                DomCheckLeftNav(addedNode);
                DomCheckNavigation(addedNode);
              //  DomCheckComment(addedNode);
            });
        }
    });
});



function StartObservation() {

    cwizObserver.observe(document, {
        childList: true,
        subtree: true,
        characterData: false,
        attributes: false
    });

}



function DomCheckLeftNav(node) {
    if (!node.classList) return;
    if (Array.from(node.classList).indexOf("OFyC1e")<0) return;

  //  if (!node.class.contains('BTaief')) return;
    SingleMeasure(Subs.Bookmarks, "useBookmarks", function () {
        var $ce=$(node);
        Subs.Bookmarks.PaintFloatingIcon($ce);
    });
}

$(document).ready(function () {
    Log.Info('G+ - filter started');
    InitSettings();
    StartObservation();

    if (document.title.indexOf("Google+ Filter") !== -1)  	// Setup-Seiten
    {
        LoadSetup();
    }
    else  {
        $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("setup/css/simple.css") + "' type='text/css' media='screen' />"));

        $(document).on('click', '.xdjHt', function () {
            // Dicker Google+ - Button
            RestartFilter();
        });
    }
});

function DrawWizard() {
    try {
        var wizard=new gpoWizard();
        var lang = chrome.i18n.getMessage("lang");
        wizard.CurrentLang=lang;

        if (!Subs.Settings.Values.LastWizard || Subs.Settings.Values.LastWizard=="null" ) {
            // Noch nie installiert
            $.get(chrome.extension.getURL("setup/" + lang + "/wizard.new.html"), function (htmlWizard) {
                $("head").append($("<link rel='stylesheet' href='" + Browser.GetExtensionFile("setup/css/wizard.css") + "' type='text/css' media='screen' />"));
                var htmlObject = $('<div/>').html(htmlWizard).contents();
                htmlObject.find('#headerImg').attr("src",chrome.extension.getURL("setup/images/optimizer_setup.jpg"));
                htmlObject.find('#helpImg').attr("src",chrome.extension.getURL("setup/images/options.png"));
                $("body").prepend(htmlObject);

                $('#wizardClose').click(function () {
                    wizard.SaveVersion();
                    $('.gPlusWizard').fadeOut();
                });
            });

        } else {
            if (wizard.NewWizardOptionsExist(Subs.Settings.Values.LastWizard)) {
                $.get(chrome.extension.getURL("setup/" + lang + "/wizard.update.html"), function (htmlWizard) {
                    $("head").append($("<link rel='stylesheet' href='" + Browser.GetExtensionFile("setup/css/wizard.css") + "' type='text/css' media='screen' />"));
                    var htmlObject = $('<div/>').html(htmlWizard).contents();
                    htmlObject.find('#headerImg').attr("src",chrome.extension.getURL("setup/images/optimizer_setup.jpg"));
                    $("body").prepend(htmlObject);

                    $('#wizardClose').click(function () {
                        wizard.SaveVersion();
                        $('.gPlusWizard').fadeOut();
                    });
                });
            }
        }
    } catch (ex) {
        // Sicherheitshalber Wizard als ausgeführt speichern, damit G+ nicht kaputt geht
        Log.Error(ex);
        wizard.SaveVersion();

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

            var $wrapper = $('.jx5iDb.pd4VHb');
            if ($wrapper.length > 0) {
                var columns = $wrapper.find('.H68wj.jxKp7').first().nextUntil(':not(.H68wj.jxKp7)').addBack().length;
                if (columns > 0) {
                    chrome.runtime.sendMessage({Action: "SaveColumns", ParameterValue: columns});
                }
            }
    } catch (ex) {
        Log.Error(ex);

    }
}




function HideOnContent(parent, element,  log ) {
    if (element !== undefined && element.length > 0) {
        if (log) {
            Log.Debug("Filtered: "+log+" ["+element.text()+"]");
        }
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
function HideOnAttr(element, attr, value, log) {
    if (element.attributes[attr].value === value) {
        $(element).hide();
        if (log) {
            Log.Debug("Block removed: "+log);
        }
    }
}



function FilterBlocks(changedElement) {
    Log.Debug("New block detected");
    changedElement.classList.add("gplusoptimizer");

    Subs.Measure = new gpoMeasure("DOM", true);

    SingleMeasureBool(Subs.Settings.Values.Featcol, "Featured Collections", function () {
        HideOnAttr(changedElement, "data-iid", "165", "Featured Collections");
    });
    SingleMeasureBool(Subs.Settings.Values.Community, "Community", function () {
        HideOnAttr(changedElement, "data-iid", "116", "Communities");
    });
    // Ab hier Zahlenwerte aus altem Layout, sind im neuen noch gar nicht vorhanden
    SingleMeasureBool(Subs.Settings.Values.Birthday, "Birthday", function () {
        HideOnAttr(changedElement, "data-iid", "114", "Birthday");
    });
    SingleMeasureBool(Subs.Settings.Values.Known, "Persons", function () {
        HideOnAttr(changedElement, "data-iid", "103", "Persons");
        HideOnAttr(changedElement, "data-iid", "105", "Persons");
        HideOnAttr(changedElement, "data-iid", "106", "Persons");
    });
    SingleMeasureBool(Subs.Settings.Values.Trending, "Trending", function () {
        HideOnAttr(changedElement, "data-iid", "102", "Trending");
    });


    return;

}

function ShowWidgets() {
    /* Widgets */
    SingleMeasure(Subs.Clock, "stoppwatch", function () {
        Subs.Clock.Dom();
    });

    SingleMeasure(Subs.Flags, "displayLang", function () {
        Subs.Flags.Dom();
    });

}

$.extend($.expr[":"], {
    "containsNC": function(elem, i, match, array) {
        return (elem.textContent || elem.innerText || "").toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
    }
});

/**
 * Filteraktionen (bei jeder DOM-Änderung)
 */
function StartFilter(changedElements) {
    changedElements.classList.add("gplusoptimizer");
    var $ce = $(changedElements);
    Subs.Measure = new gpoMeasure("DOM", true);

    /* WHAM */
    SingleMeasureBool(Subs.Settings.Values.Wham, "Wham", function () {
        if (Subs.Settings.Values.WHAMWhamText) {
            HideOnContent($ce, $ce.find('[jsname="EjRJtf"]:containsNC("wham")'), "WHAM-Fulltext:WHAM");
        }
        if (Subs.Settings.Values.WHAMChristmasText) {
            HideOnContent($ce, $ce.find('[jsname="EjRJtf"]:containsNC("Last Christmas")'),"WHAM-Fulltext:LC");
            HideOnContent($ce, $ce.find('[jsname="EjRJtf"]:containsNC("LastChristmas")'),"WHAM-Fulltext:LC");
        }
        if (Subs.Settings.Values.WHAMWhamUrl) {
            HideOnContent($ce, $ce.find('a:containsNC("wham")'),"WHAM-Link:Wham");
        }
        if (Subs.Settings.Values.WHAMChristmasUrl) {
            HideOnContent($ce, $ce.find('a:containsNC("LastChristmas")'),"WHAM-Link:LC");
            HideOnContent($ce, $ce.find('a:containsNC("Last Christmas")'),"WHAM-Link:LC");
        }
    });

    /* Postillon */
    SingleMeasureBool(Subs.Settings.Values.Postillon, "Postillon", function() {
        DOMFilterPostillon($ce);
    });

    /* Blöcke */
    SingleMeasureBool(Subs.Settings.Values.Plus1, "Plus1", function () {
        HideOnContent($ce, $ce.find('.sLDTkb').find('.RcaDXc'), "Plus1");
    //    HideOnContent($ce, $ce.find('.sLDTkb').find('.aaTEdf'), "Collection-Spam");    //Hat dieses und xxx weitere Updates hinzugefügt. Taucht nur bei mehreren gleichzeitigen Posts auf
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
    /*
    SingleMeasureBool(Subs.Settings.Values.FilterSharedCircles, "Shared Circles", function () {
        HideOnContent($ce, $ce.find('div.ki.ve').find('div.Wy'));
    });
    */


    /* Erweiterungen */
    SingleMeasure(Subs.Domain, "domain", function () {
        Subs.Domain.Dom($ce);
    });
    /*
    SingleMeasure(Subs.Trophy, "displayTrophy", function () {
        Subs.Trophy.Dom($ce);
    });*/
    SingleMeasure(Subs.User, "colorUser", function () {
        Subs.User.Dom($ce);
    });
    SingleMeasure(Subs.Emoticons, "showEmoticons", function () {
        Subs.Emoticons.Dom($ce);
    });

    SingleMeasure(Subs.Bookmarks, "useBookmarks", function () {
        Subs.Bookmarks.Dom($ce);
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
            HideOnContent($ce, $ce.find('[jsname="EjRJtf"]:Contains(' + fulltext + ')'),"Fulltext:"+fulltext);
        });
    } catch (ex) {
        Log.Error(ex);
    }
}

/*
Postillon
 */
function DOMFilterPostillon ($ce) {
    var obj = this;
    $ce.find('.wftCae').each(function () {
        if ($(this).text().indexOf("!!!!!!!!!!") >= 0) {
            $(this).html($(this).html().replaceAll("!!!!!!!!!!", "ﾔ"));
        }
        if ($(this).text().indexOf("???!!?") >= 0) {
            $(this).html($(this).html().replaceAll("???!!?", "‽"));
        }
    });
}

/**
 * Bilder, Videos und Links ausblenden
 */
function DOMFilterImages($ce) {
        return;     // Animitertes GIF-Filter und Co. macht im neuen Layout derzeit keinen Sinn
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
        Log.Error(ex);
    }
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
                    HideOnContent($ce, $ce.find('.ot-hashtag:Contains(' + hashTag + ')'),"Hashtag:"+hashTag);
                }
            });
        }
    } catch (ex) {
        Log.Error(ex);
    }
}

function AddHashtagToList(newHashtag) {
    Subs.Settings.Values.HashTags += "," + newHashtag;
    Subs.Settings.Save("HashTags", Subs.Settings.Values.HashTags);

    ShowNotification("success", chrome.i18n.getMessage("HashtagFilteredTitle"), chrome.i18n.getMessage("HashtagFiltered").replace("_KEYWORD_", newHashtag));
}

function InitObject(condition, object) {
    if (condition) {
        return new object(Log);
    }
    return null;
}


function InitObjects() {
    Subs.Bookmarks = InitObject(Subs.Settings.Values.UseBookmarks, gpoBookmarks);
    Subs.Autosave = InitObject(Subs.Settings.Values.UseAutoSave, gpoAutosave);
    Subs.Flags = InitObject(Subs.Settings.Values.DisplayLang, gpoFlags);
    Subs.Domain = InitObject(Subs.Settings.Values.MarkLSR || Subs.Settings.Values.MarkAdblock || Subs.Settings.Values.MarkCustom, gpoDomainBlock);
    Subs.Trophy = InitObject(Subs.Settings.Values.DisplayTrophy, gpoTrophy);
    Subs.Clock = InitObject(Subs.Settings.Values.Stoppwatch, gpoClock);
    Subs.Emoticons = InitObject(Subs.Settings.Values.ShowEmoticons, gpoEmoticons);
    Subs.User = InitObject(Subs.Settings.Values.ColorUsers, gpoUser);
    if (Subs.User !== null) {
        Subs.User.AllUserSettings = Subs.Settings.Values.UserCols;
    }

    if ($('.gb_7a').length>0) {
        // Gültig in beiden Layouts
        chrome.runtime.sendMessage({Action: "SaveUserName", ParameterValue: $('.gb_7a').text()});
        loaded=true;
    }
//    StartObservation();
}

function PageLoad() {
        InitObjects()
        DrawWizard();;

        Subs.Measure = new gpoMeasure("START", true);

        //var wizard = JSON.parse(Subs.Settings.Values.WizardMode);




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

        SingleMeasure(Subs.Domain, "markDomain", function () {
            Subs.Domain.Init(Subs.Settings.Values);
        });

        SingleMeasure(Subs.Emoticons, "showEmoticons", function () {
            Subs.Emoticons.Init();
        });

        DrawWidgets();
        CountColumns();
        FirstStartInit();
        RestartFilter();

        Log.Info('G+Filter: Google+ - Filter initialized');
}

function RestartFilter() {
    Log.Info("Filter restarted (new page opened)");
    $(document).ready(function() {
        window.setTimeout(function () {
            FirstStartInit();
         //   Log.Debug("Timeout reached");
        }, 5000);
    });
}

function FirstStartInit() {

    $('c-wiz:not(".gplusoptimizer")').each(function (index, value) {
        DomCheckArticle(value);
        //StartFilter(value);
    });
    $('div:not(".gplusoptimizer")').each(function (index, value) {
        DomCheckBlock(value);
    });

    if ($('.gplusoptimizer').length===0) {
        // Keine blöcke bearbeitet, vermutlich noch am laden
        RestartFilter();
    }
    if (loaded) {
        ShowWidgets();
    }
    SingleMeasure(Subs.Bookmarks, "useBookmarks", function () {
        Subs.Bookmarks.PaintFloatingIcon($(document));
    });
}

function StartFilterLoop() {
    var timerId = setInterval(FirstStartInit, 10000);   // Einmal alle 10 Sekunden ungefiltere Elemente filtern
}

/**
 * Widget-Block zeichne
 * @param {int} position position der Spalte
 * @param {string} id Id des Blocks
 */
function CreateBlock(position, id) {
    var wrapper = "<div  tabindex=\"-1\" class=\"nja\" id=\"" + id + "\"></div>";

        if (position === 1) {
            $('.uenjKc').append(wrapper);
        } else {
            $(".rymPhb .H68wj:nth-child(" + position + ")").prepend(wrapper);
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

