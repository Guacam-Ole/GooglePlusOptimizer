var oldLayout=true;
var loaded=false;

this.Browser = new Browser();
this.Log=new gpoLog();
this.Log.Init();
var columnCount;
var imageHost = "https://files.oles-cloud.de/optimizer/";
var debugMode=localStorage.getItem("debugMode")==="true";

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

var newObserver= new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (oldUrl!==window.location.href) {
            RestartFilter();    // Neue Seite aufgerufen, z.B. "Angesagte Beiträge", Person, Community
        }
        oldUrl=window.location.href;
        if (mutation.type === "childList") {
            Log.Debug("mutation: Childlist:"+mutation.addedNodes.length);
            forEach.call(mutation.addedNodes, function (addedNode) {
                if (addedNode.classList !== undefined) {
                    if (addedNode.classList.contains('PD')) {
                        // Gibt (noch) keine Hashtaglisten im neuen Layout
                    } else if (addedNode.classList.contains('nja')) {
                        // Gibt (noch) keine Vorschläge u.ä. im neuen Layout
                    }
                    else {
                        var jsModel = addedNode.attributes["jsmodel"];
                        if (jsModel !== undefined && jsModel.value === "rIipNe iMhCXb") { // Neuer Artikelblock
                            Log.Debug("DOM JS:"+addedNode.classList);
                            StartFilter(addedNode);
                        } else {
                            Log.Debug("DOM IGNORED:"+addedNode.classList);
                            //               Log.Debug("iid:"+addedNode.data("id"));
                        }
                    }
                }
            });
        }
    });
    if (loaded) {
        ShowWidgets();
        MoveHeaderIcon();   // Evtl. Prüfen, ob man das auch an einen konkreten Dom-Change festmachen kann...
    }
});

var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (oldUrl!==window.location.href) {
            RestartFilter();    // Neue Seite aufgerufen, z.B. "Angesagte Beiträge", Person, Community
        }
        oldUrl=window.location.href;
        if (mutation.type === "childList") {
           Log.Debug("mutation: Childlist:"+mutation.addedNodes.length);
            forEach.call(mutation.addedNodes, function (addedNode) {
                if (addedNode.classList !== undefined) {
                    if (addedNode.classList.contains('PD')) {
                        Log.Debug("DOM PD:"+addedNode.classList);
                        PaintBin(addedNode);
                    } else if (addedNode.classList.contains('nja')) {
                        Log.Debug("DOM NJA:"+addedNode.classList);
                        FilterBlocks(addedNode);
                    } else if (addedNode.classList.contains('URaP8')) {
                        Log.Debug("DOM URA:" + addedNode.classList);
                        DoQuickshare(addedNode, 1);
                    }
                    //g-h-f-N-N
                    else {
                        var jsModel = addedNode.attributes["jsmodel"];
                        if (jsModel !== undefined && jsModel.value === "XNmfOc") {
                            Log.Debug("DOM JS:"+addedNode.classList);
                            StartFilter(addedNode);
                        } else {
                            Log.Debug("DOM IGNORED:"+addedNode.classList);
             //               Log.Debug("iid:"+addedNode.data("id"));
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
    if (loaded) {
        ShowWidgets();
        MoveHeaderIcon();   // Evtl. Prüfen, ob man das auch an einen konkreten Dom-Change festmachen kann...
    }
});

function StartObservation() {
    if (oldLayout) {
        observer.observe(document, {
            childList: true,
            subtree: true,
            characterData: false,
            attributes: false
        });
    } else {
        newObserver.observe(document, {
            childList: true,
            subtree: true,
            characterData: false,
            attributes: false
        });
    }
}

InitSettings();

$(document).ready(function () {


    console.log('g+ - filter started');
    oldLayout=$('.FGhx7c')===null || $('.FGhx7c').length===0;
    console.log(oldLayout?"(old Layout)":"(new Layout)");
    StartObservation();
    chrome.runtime.sendMessage({Action: "SetSetting", Name: "oldLayout", Value: oldLayout});

    if (document.title.indexOf("Google+ Filter") !== -1)  	// Setup-Seiten
    {
        LoadSetup();
    }
    else  {
        $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("setup/css/simple.css") + "' type='text/css' media='screen' />"));



        if (oldLayout) {
            $(document).on('click', '.unhideImage', function () {
                $(this).parent().find('.hidewrapper').show();
                $(this).remove();
                return false;
            });

            $(document).on('click', '.removeHashTag', function () {
                Log.Info('Add Hashtag');
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
            $(document).on('click', '.JZ', function () {
                RestartFilter();  // Reload Page. Limitieren auf 20 neue Objekte, sonst wirds zu langsam
            });
        }
    }
});


/**
 * Wizard-Kachel zeichnen
 */
function DrawWizardTile() {
    if (!oldLayout) {
        return;    // Derzeit noch kein Wizard im neuen Layout, weil: Sieht echt scheiße aus
    }
    //return;
    try {
        var wizard=new gpoWizard();


        var lang = chrome.i18n.getMessage("lang");
        wizard.CurrentLang=lang;
        if (wizard.NewWizardOptionsExist(Subs.Settings.Values.LastWizard)) {
            $.get(chrome.extension.getURL("setup/" + lang + "/wizardloader.html"), function (htmlWizard) {
                var htmlObject = $('<div/>').html(htmlWizard).contents();
                if (oldLayout) {
                    $('.Ypa.jw.am :first').prepend(htmlObject.find('[data-iid="wizard"]'));
                } else {
                    $('.H68wj.jxKp7 :first').prepend(htmlObject.find('[data-iid="wizard"]'));

                }
                $('#wizardStart').click(function () {
                    $("head").append($("<link rel='stylesheet' href='" + Browser.GetExtensionFile("setup/css/bootstrap.min.css") + "' type='text/css' media='screen' />"));
                    $("head").append($("<link rel='stylesheet' href='" + Browser.GetExtensionFile("setup/css/bootstrap-switch.css") + "' type='text/css' media='screen' />"));
                    $("head").append($("<link rel='stylesheet' href='" + Browser.GetExtensionFile("setup/css/wizard.css") + "' type='text/css' media='screen' />"));
                    var wizz = $('<div id="loadhere">&nbsp;</div>');
                    $('body').prepend(wizz);
                    $('#loadhere').load(Browser.GetExtensionFile("setup/" + lang + "/wizard.html"), function () {
                        wizard.InitWizard(Subs.Settings.Values.LastWizard);
                        Log.Info('Wizard loaded');
                    });
                });
            });
        }
    } catch (ex) {
        Log.Error(ex);
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
            Subs.Weather.Init(oldLayout);
        });
    }

    if (Subs.Clock !== null) {
        Subs.Measure.Do("stoppwatch", function () {
            CreateBlock(JSON.parse(Subs.Settings.Values.Stoppwatch) + 1, "clock");
            Subs.Clock.Init(oldLayout);
        });
    }
}

/**
 * Spalten zählen
 */
function CountColumns() {
    try {
        if (oldLayout) {
            var $wrapper = $('.ona.Fdb');
            if ($wrapper.length > 0) {
                var columns = $wrapper.find('.Ypa.jw.am').first().nextUntil(':not(.Ypa.jw.am)').addBack().length;
                if (columns > 0) {
                    chrome.runtime.sendMessage({Action: "SaveColumns", ParameterValue: columns});
                }
            }
        } else {
            var $wrapper = $('.jx5iDb.pd4VHb');
            if ($wrapper.length > 0) {
                var columns = $wrapper.find('.H68wj.jxKp7').first().nextUntil(':not(.H68wj.jxKp7)').addBack().length;
                if (columns > 0) {
                    chrome.runtime.sendMessage({Action: "SaveColumns", ParameterValue: columns});
                }
            }
        }
    } catch (ex) {
        Log.Error(ex);
    }
}



function MoveHeaderIcon() {
    if (oldLayout) {
        // Kein Floating im neuen Layout
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



function FilterBlocks(changedElements) {
    if (!oldLayout) {
        return;
    }
    changedElements.classList.add("gplusoptimizer");
    var $ce = $(changedElements);
    Subs.Measure = new gpoMeasure("DOM", true);
    SingleMeasureBool(Subs.Settings.Values.Community, "Community", function () {
        HideOnAttr($ce, 'data-iid', 'sii2:112');
        HideOnAttr($ce, 'data-iid', 'sii2:116');
        HideOnAttr($ce, 'data-iid', 'sii2:127');
    });
    SingleMeasureBool(Subs.Settings.Values.Birthday, "Birthday", function () {
        HideOnAttr($ce, 'data-iid', 'sii2:114');
    });
    SingleMeasureBool(Subs.Settings.Values.Known, "Persons", function () {
        HideOnAttr($ce, 'data-iid', 'sii2:103');
        HideOnAttr($ce, 'data-iid', 'sii2:105');
        HideOnAttr($ce, 'data-iid', 'sii2:106');
    });
    SingleMeasureBool(Subs.Settings.Values.Trending, "Trending", function () {
        HideOnAttr($ce, 'data-iid', 'sii2:102');
    });
    SingleMeasureBool(Subs.Settings.Values.Featcol, "Featured Collections", function () {
        HideOnAttr($ce, 'data-iid', 'sii2:165');
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
    changedElements.classList.add("gplusoptimizer");
    var $ce = $(changedElements);
    Subs.Measure = new gpoMeasure("DOM", true);



   // MoveHeaderIcon();   // Prüfen wg. Performance!

    /* WHAM */
    SingleMeasureBool(Subs.Settings.Values.Wham, "Wham", function () {
        if (Subs.Settings.Values.WHAMWhamText) {
            if (oldLayout) {
                HideOnContent($ce, $ce.find('.Xx.xJ:Contains("wham")'));
            } else {
                HideOnContent($ce, $ce.find('.ELUvyf:Contains("wham")'));
            }
        }
        if (Subs.Settings.Values.WHAMChristmasText) {
            if (oldLayout) {
                HideOnContent($ce, $ce.find('.Xx.xJ:Contains("Last Christmas")'));
                HideOnContent($ce, $ce.find('.Xx.xJ:Contains("LastChristmas")'));
            } else {
                HideOnContent($ce, $ce.find('.ELUvyf:Contains("Last Christmas")'));
                HideOnContent($ce, $ce.find('.ELUvyf:Contains("LastChristmas")'));
            }
        }
        if (Subs.Settings.Values.WHAMWhamLink) {
            if (oldLayout) {
                HideOnContent($ce, $ce.find('.yx.Nf:Contains("wham")'));
            } else {
                HideOnContent($ce, $ce.find('.IJZbFe :Contains("wham")'));
            }
        }
        if (Subs.Settings.Values.WHAMChristmasLink) {
            if (oldLayout) {
                HideOnContent($ce, $ce.find('.yx.Nf:Contains("LastChristmas")'));
                HideOnContent($ce, $ce.find('.yx.Nf:Contains("Last Christmas")'));
            } else {
                HideOnContent($ce, $ce.find('.IJZbFe :Contains("LastChristmas")'));
                HideOnContent($ce, $ce.find('.IJZbFe :Contains("Last Christmas")'));
            }
        }
    });

    /* Postillon */
    SingleMeasureBool(Subs.Settings.Values.Postillon, "Postillon", function() {
        DOMFilterPostillon($ce);
    });

    /* Blöcke */
    SingleMeasureBool(Subs.Settings.Values.Plus1, "Plus1", function () {
        if (oldLayout) {
            HideOnContent($ce, $ce.find('.xv'));
        } else {
            HideOnContent($ce, $ce.find('.RcaDXc'));
        }
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
      //  Subs.Bookmarks.PaintStars($ce);
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
            if (oldLayout) {
                HideOnContent($ce, $ce.find('div.Xx.xJ:Contains(' + fulltext + ')'));
                HideOnContent($ce, $ce.find('div.Al.pf:Contains(' + fulltext + ')'));
            } else {
                HideOnContent($ce, $ce.find('div.ELUvyf:Contains(' + fulltext + ')'));
            }
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

    if (oldLayout) {
        $ce.find('.Ct').each(function () {
            if ($(this).text().indexOf("!!!!!!!!!!") >= 0) {
                $(this).html($(this).html().replaceAll("!!!!!!!!!!", "ﾔ"));
            }
            if ($(this).text().indexOf("???!!?") >= 0) {
                $(this).html($(this).html().replaceAll("???!!?", "‽"));
            }
        });
    } else {
        $ce.find('.wftCae').each(function () {
            if ($(this).text().indexOf("!!!!!!!!!!") >= 0) {
                $(this).html($(this).html().replaceAll("!!!!!!!!!!", "ﾔ"));
            }
            if ($(this).text().indexOf("???!!?") >= 0) {
                $(this).html($(this).html().replaceAll("???!!?", "‽"));
            }
        });
    }
}

/**
 * Bilder, Videos und Links ausblenden
 */
function DOMFilterImages($ce) {
    if (!oldLayout) {
        return;     // Animitertes GIF-Filter und Co. macht im neuen Layout derzeit keinen Sinn
    }
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

function PaintBin(ce) {
    if (!oldLayout) {
        return;
    }
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
                    if (oldLayout) {
                        HideOnContent($ce, $ce.find('.zda.Zg:Contains(' + hashTag + ')'));
                        HideOnContent($ce, $ce.find('.ot-hashtag:Contains(' + hashTag + ')'));
                        HideOnContent($ce, $ce.find("a[data-topicid='\/hashtag\/" + hashTag.toLowerCase() + "']"));
                    } else {
                        HideOnContent($ce, $ce.find('.ot-hashtag:Contains(' + hashTag + ')'));
                    }
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
        return new object;
    }
    return null;
}


function InitObjects() {
    Subs.Bookmarks = InitObject(Subs.Settings.Values.UseBookmarks, gpoBookmarks);
    Subs.Autosave = InitObject(oldLayout && Subs.Settings.Values.UseAutoSave, gpoAutosave); // Autosave erst mal raus im neuen Layout
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

    if ($('.gb_7a').length>0) {
        // Gültig in beiden Layouts
        chrome.runtime.sendMessage({Action: "SaveUserName", ParameterValue: $('.gb_7a').text()});
        loaded=true;
    }
//    StartObservation();
}

function PageLoad() {
        InitObjects();
        Subs.Measure = new gpoMeasure("START", true);

        var wizard = JSON.parse(Subs.Settings.Values.WizardMode);


        SingleMeasureBool(wizard >= 0, "wizard", function () {
            DrawWizardTile();
        });

        SingleMeasure(Subs.Bookmarks, "useBookmarks", function () {
            Subs.Bookmarks.Init(oldLayout);
        });

        SingleMeasure(Subs.Autosave, "useAutoSave", function () {
            Subs.Autosave.CleanupAutosave();
            Subs.Autosave.Init(oldLayout);
        });

        SingleMeasure(Subs.User, "colorUser", function () {
            Subs.User.Init(oldLayout);
        });

        SingleMeasure(Subs.Trophy, "displayTrophy", function () {
            Subs.Trophy.Init(oldLayout);
        });

        SingleMeasureBool(Subs.Settings.Values.DisplayQuickHashes, "displayQuickHashes", function () {
         //   $('#contentPane').parent().prepend('<div id="quickht">Quick-Hashtags:<br/></div>');
        });

        SingleMeasure(Subs.Lsr, "markLSRPosts", function () {
            Subs.Lsr.Init(oldLayout);
        });



        DrawWidgets();
        CountColumns();


        FirstStartInit();
        //RestartFilter();


        Log.Info('G+Filter: Google+ - Filter initialisiert');
}

function RestartFilter() {
    window.setTimeout(function() {
            FirstStartInit();
    },5000);
}

function FirstStartInit() {
    if (oldLayout) {
        // Initial Mutation Observer simulieren:
        $('[jsmodel="XNmfOc"]:not(".gplusoptimizer")').each(function (index, value) {
            StartFilter(value);
        });
        $('.nja:not(".gplusoptimizer")').each(function (index, value) {
            FilterBlocks(value);
        });
    } else {
        $('[jsmodel="rIipNe iMhCXb"]:not(".gplusoptimizer")').each(function (index, value) {
            StartFilter(value);
        });

    }
    if ($('.gplusoptimizer').length===0) {
        // Keine blöcke bearbeitet, vermutlich noch am laden
        RestartFilter();
    }


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
    if (oldLayout) {
        if (position === 1) {
            $('[data-iid="sii2:111"]').append(wrapper);
        } else {

            $(".ona.Fdb .Ypa:nth-child(" + position + ")").prepend(wrapper);
        }
    } else {
        if (position === 1) {
            $('.uenjKc').append(wrapper);
        } else {
            $(".rymPhb .H68wj:nth-child(" + position + ")").prepend(wrapper);
        }
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

