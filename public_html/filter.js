/*
 * File:    filter.js
 * Packet:  G+ Optimizer
 * Author:  Ole Albers
 * 
 * Hauptsächlich "Hintergrundoperationen" zum Lesen und Schreiben von Einstellungen
 */


// Null-Wert in Boolean umwandeln
function BoolNotNull(anyvalue)
{
    if (anyvalue === null || anyvalue === "undefined")
    {
        return "false";
    }
    else
    {
        return anyvalue;
    }
}

function BoolNotNullReverse(anyvalue)
{
    if (anyvalue === null || anyvalue === "undefined")
    {
        return "true";
    }
    else
    {
        return anyvalue;
    }
}

function GetToken()
{
    chrome.identity.getAuthToken({'interactive': true}, function(token)
    {
        console.log(token);
        return token;
    });
    if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError);
        return null;
    }
}

// String-Bool in echtes Bool wandeln
function GetBool(originalValue)
{
    try
    {
        return JSON.parse(originalValue);
    } catch (ex)
    {
        console.log(ex);
    }
}

// Icon in der Adressleiste von Chrome anzeigen
chrome.extension.onMessage.addListener(function(request, sender) {
    if (request === "show_page_action") {
        chrome.pageAction.show(sender.tab.id);
    }
});

// Datenaustausch mit Background-jQuery-File
chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse)
        {
            if (request.Action === "GetToken")
            {
                chrome.identity.getAuthToken({'interactive': true}, function(token)
                {
                    console.log("token:" + token);
                    sendResponse({Result: token});
                });
                return true;
            }
            else if (request.Action === "SaveQS")
            {
                localStorage.setItem("QuickShares", request.QuickShares);
                sendResponse({Result: "Setting saved."});
            }
            else if (request.Action === "LoadQS")
            {
                sendResponse({Result: localStorage.getItem("QuickShares")});
            }
            else if (request.Action === "LoadCircles")
            {
                var circles = localStorage.getItem("Circles") || null;
                if (circles !== null) {
                    circles = JSON.parse(circles);
                } else {
                    circles = [];
                }
                sendResponse({Result: circles});
            }
            else if (request.Action === "SaveColumns")
            {
                localStorage.setItem("columns", request.ParameterValue);
                sendResponse({Result: "Setting Saved."});
            }
            else if (request.Action === "SaveHashtags")
            {
                // Hashtags speichern (Nach Live-Änderung in G+)
                localStorage.setItem("hashTags", request.ParameterValue);
                sendResponse({Result: "Setting Saved."});
            }
            else if (request.Action === "SaveKeywords")
            {
                // Keywords speichern (Nach Live-Änderung in G+)
                localStorage.setItem("fulltext", request.ParameterValue);
                sendResponse({Result: "Setting Saved."});
            }
            else if (request.Action === "SaveUsers")
            {
                localStorage.setItem("UserCols", request.ParameterValue);
                sendResponse({Result: "Settings Saved."});
            }
            else if (request.Action === "LoadUsers")
            {
                var userSettings = localStorage.getItem("UserCols");
                sendResponse({
                    AllUserSettings: userSettings,
                    Result: "Settings loaded."
                });
            }
            else if (request.Action==="CreateContextMenu") {
                CreateContextMenu();
                sendResponse({Result: "ContextMenu Created"});
            }

            else if (request.Action === "SaveCircles")
            {
                localStorage.setItem("Circles", request.ParameterValue);
            }
            else if (request.Action === "SaveBookmarks")
            {
                localStorage.setItem("Bookmarks", request.ParameterValue);
            }
            else if (request.Action === "LoadBookmarks") {
                var bookmarks = localStorage.getItem("Bookmarks");
                sendResponse({Result: bookmarks});
            }
            else if (request.Action === "SaveBookmarkContents")
            {
                localStorage.setItem("BookmarkContents", request.ParameterValue);
            }
            else if (request.Action === "LoadBookmarkContents") {
                var bookmarkContents = localStorage.getItem("BookmarkContents");
                sendResponse({Result: bookmarkContents});
            }
            else if (request.Action === "SaveWizardVersion") {
                localStorage.setItem("lastWizard", request.ParameterValue);
            }
            else if (request.Action === "SaveAll")
            {
                localStorage.setItem("plus1", request.plus1);
                localStorage.setItem("yt", request.yt);
                localStorage.setItem("wham", request.wham);
                localStorage.setItem("hashtag", request.hashtag);
                localStorage.setItem("custom", request.custom);
                localStorage.setItem("community", request.community);
                localStorage.setItem("birthday", request.birthday);
                localStorage.setItem("known", request.known);
                localStorage.setItem("fulltext", request.fulltext);
                localStorage.setItem("WHAMWhamText", request.WHAMWhamText);
                localStorage.setItem("WHAMWhamUrl", request.WHAMWhamUrl);
                localStorage.setItem("WHAMChristmasText", request.WHAMChristmasText);
                localStorage.setItem("WHAMChristmasUrl", request.WHAMChristmasUrl);
                localStorage.setItem("StoppWatch", request.StoppWatch);
                localStorage.setItem("Sport", request.Sport);
                localStorage.setItem("Weather", request.Weather);
                localStorage.setItem("colorUsers", request.colorUsers);
                localStorage.setItem("filterImages", request.filterImages);
                localStorage.setItem("filterVideo", request.filterVideo);
                localStorage.setItem("filterLinks", request.filterLinks);
                localStorage.setItem("filterGifOnly", request.filterGifOnly);
                localStorage.setItem("filterMp4Only", request.filterMp4Only);
                localStorage.setItem("displayTrophy", request.displayTrophy);
                localStorage.setItem("trophies", request.trophies);
                localStorage.setItem("lastTrophyRead", request.lastTrophyRead);
                localStorage.setItem("showEmoticons", request.showEmoticons);
                localStorage.setItem("useAutoSave", request.UseAutoSave);
                localStorage.setItem("useBookmarks", request.UseBookmarks);



                sendResponse({Result: "Settings Saved."});
            }
            else if (request.Action === "LoadAll")
            {
                // Alle relevanten Paramter für Background-Script laden
                var filterPlus1 = localStorage.getItem("plus1");
                var filterYouTube = localStorage.getItem("yt");
                var filterWham = localStorage.getItem("wham");
                var filterHashTag = localStorage.getItem("hashtag");
                var filterCustom = localStorage.getItem("custom");
                var filterCommunity = localStorage.getItem("community");
                var filterBirthday = localStorage.getItem("birthday");
                var filterPersons = localStorage.getItem("known");
                var propsHashtags = localStorage.getItem("hashTags");
                var propsFulltext = localStorage.getItem("fulltext");
                var whamWhamText = localStorage.getItem("WHAMWhamText");
                var whamWhamLink = localStorage.getItem("WHAMWhamUrl");
                var whamChristmasText = localStorage.getItem("WHAMChristmasText");
                var whamChristmasLink = localStorage.getItem("WHAMChristmasUrl");
                var stoppwatch = localStorage.getItem("StoppWatch");
                var sport = localStorage.getItem("Sport");
                var wetter = localStorage.getItem("Weather");
                var colorUsers = localStorage.getItem("colorUsers");
                var filterImages = localStorage.getItem("filterImages");
                var filterVideo = localStorage.getItem("filterVideo");
                var filterLinks = localStorage.getItem("filterLinks");
                var filterGifOnly = localStorage.getItem("filterGifOnly");
                var filterMp4Only = localStorage.getItem("filterMp4Only");
                var displayTrophy = localStorage.getItem("displayTrophy");
                var trophies = localStorage.getItem("trophies");
                var showEmoticons = localStorage.getItem("showEmoticons");
                var lastWizard = localStorage.getItem("lastWizard");
                var lastTrophyRead = localStorage.getItem("lastTrophyRead");
                var useBookmarks=localStorage.getItem("useBookmarks");
                var useAutoSave = localStorage.getItem("useAutoSave");
                var wizardMode = localStorage.getItem("WizardMode") || 1;
                if (wizardMode === null) {
                    wizardMode = 1;
                }

                var interval = JSON.parse(localStorage.getItem("interval"));
                if (interval === null || interval < 10)
                {
                    interval = 500;
                }
                useAutoSave = BoolNotNull(useAutoSave);
                filterPlus1 = BoolNotNull(filterPlus1);
                filterYouTube = BoolNotNull(filterYouTube);
                filterWham = BoolNotNull(filterWham);
                filterHashTag = BoolNotNull(filterHashTag);
                filterCustom = BoolNotNull(filterCustom);
                filterCommunity = BoolNotNull(filterCommunity);
                filterBirthday = BoolNotNull(filterBirthday);
                filterPersons = BoolNotNull(filterPersons);
                whamWhamText = BoolNotNull(whamWhamText);
                whamWhamLink = BoolNotNull(whamWhamLink);
                whamChristmasText = BoolNotNull(whamChristmasText);
                whamChristmasLink = BoolNotNull(whamChristmasLink);
                colorUsers = BoolNotNullReverse(colorUsers);
                filterImages = BoolNotNull(filterImages);
                filterVideo = BoolNotNull(filterVideo);
                filterLinks = BoolNotNull(filterLinks);
                filterGifOnly = BoolNotNull(filterGifOnly);
                filterMp4Only = BoolNotNull(filterMp4Only);
                displayTrophy = BoolNotNull(displayTrophy);
                showEmoticons = BoolNotNull(showEmoticons);
                useBookmarks=BoolNotNull(useBookmarks);

                sendResponse({
                    FilterPlus1: GetBool(filterPlus1),
                    FilterYouTube: GetBool(filterYouTube),
                    FilterWham: GetBool(filterWham),
                    FilterHashTag: GetBool(filterHashTag),
                    FilterCustom: GetBool(filterCustom),
                    FilterCommunity: GetBool(filterCommunity),
                    FilterBirthday: GetBool(filterBirthday),
                    FilterPersons: GetBool(filterPersons),
                    PropsHashtags: propsHashtags,
                    PropsFulltext: propsFulltext,
                    WhamWhamText: GetBool(whamWhamText),
                    WhamWhamLink: GetBool(whamWhamLink),
                    WhamChristmasText: GetBool(whamChristmasText),
                    WhamChristmasLink: GetBool(whamChristmasLink),
                    ColorUsers: GetBool(colorUsers),
                    FilterImages: GetBool(filterImages),
                    FilterVideo: GetBool(filterVideo),
                    FilterGifOnly: GetBool(filterGifOnly),
                    FilterMp4Only: GetBool(filterMp4Only),
                    FilterLinks: GetBool(filterLinks),
                    DisplayTrophy: GetBool(displayTrophy),
                    ShowEmoticons: GetBool(showEmoticons),
                    WizardMode: wizardMode,
                    Trophies: trophies,
                    Sport: sport,
                    Wetter: wetter,
                    Interval: interval,
                    Stoppwatch: stoppwatch,
                    LastTrophyRead: lastTrophyRead,
                    UseBookmarks:GetBool(useBookmarks),
                    lastWizard: lastWizard,
                    UseAutoSave: GetBool(useAutoSave),
                    Result: "Settings loaded."
                });
            }
        });


function onClickHandler(info, tab) {
    if (info.menuItemId === 'hashtagfilter') {
        var tag = decodeURIComponent(info.linkUrl.replace('https://plus.google.com/s/', '').replace('https://plus.google.com/explore/', ''));
        addHashtag(tag);
    } else if (info.menuItemId === 'keywordfilter') {
        var keywords = info.selectionText.split(/[^\w\d]+/);
        addKeyword(keywords);
    }
}
;

function addKeyword(keyword) {
    var keywords = localStorage.getItem("fulltext") || null;
    if (keywords === null) {
        keywords = keyword;
    } else {
        keywords += "," + keyword;
    }
    localStorage.setItem("fulltext", keywords);
}

function addHashtag(hashtag) {
    var hashtags = localStorage.getItem("hashTags") || null;
    if (hashtags === null) {
        hashtags = hashtag;
    } else {
        hashtags += "," + hashtag;
    }
    localStorage.setItem("hashTags", hashtags);
}


chrome.contextMenus.onClicked.addListener(onClickHandler);
var showForPages = ["https://plus.google.com/*"];

chrome.runtime.onInstalled.addListener(function() {
   CreateContextMenu();
});

function CreateContextMenu() {
     chrome.contextMenus.create({
        title: chrome.i18n.getMessage("RemoveHashtag"),
        id: 'hashtagfilter',
        contexts: ['link'],
        targetUrlPatterns: ['*://*/s/*', '*://*/explore/*'],
        "documentUrlPatterns":showForPages
    });

    chrome.contextMenus.create({
        title: chrome.i18n.getMessage("RemoveKeyword"),
        id: 'keywordfilter',
        contexts: ['selection'],
        "documentUrlPatterns":showForPages
    });
}
