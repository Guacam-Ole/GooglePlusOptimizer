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
            if (request.Action === "SaveColumns")
            {
                localStorage.setItem("columns", request.ParameterValue);
                sendResponse({Result: "Setting Saved."});
            }
            if (request.Action === "SaveHashtags")
            {
                // Hashtags speichern (Nach Live-Änderung in G+)
                localStorage.setItem("hashTags", request.ParameterValue);
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

                var interval = JSON.parse(localStorage.getItem("interval"));
                if (interval === null || interval < 10)
                {
                    interval = 500;
                }

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
                    Sport: sport,
                    Wetter: wetter,
                    Interval: interval,
                    Stoppwatch: stoppwatch,
                    Result: "Settings loaded."
                });
            }
        });

  