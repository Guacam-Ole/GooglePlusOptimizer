
chrome.runtime.onMessage.addListener(
    function(request,sender,sendResponse)  {
        if (request.Action==="GetSetting") {
            var returnvalue=localStorage.getItem(request.Name);
            sendResponse({Result: returnvalue});
        }
        else if (request.Action==="AddTick") {
            var oldTicks=localStorage.getItem("Measurements_"+request.Scope);
            if (oldTicks===undefined || oldTicks===null) {
                oldTicks= [];
            } else {
                oldTicks = JSON.parse(oldTicks);
            }
            oldTicks.push({Name:request.Name, Scope:request.Scope, Start:request.Start, Stop:request.Stop});
            localStorage.setItem("Measurements_"+request.Scope,JSON.stringify(oldTicks));                 
        }
        else if (request.Action==="DeleteTicks") {
             localStorage.removeItem("Measurements_"+request.Scope);
        }
        else if (request.Action==="GetSoccerScores") {
            var orderId=request.Day;
            var smallCompleteUrl = "http://www.nocarrier.de/opendb.php?command=GetCurrentGroup&league=" + request.League;
            $.getJSON(smallCompleteUrl, function(data) {
                if (orderId===null) {
                    orderId = data.groupOrderID;
                }
                var completeUrl = "http://www.nocarrier.de/opendb.php?command=GetResults&league=" + request.League + "&season=" + request.Season + "&orderId=" + orderId;
                $.getJSON(completeUrl, function(inner) {
                    var res=JSON.stringify(inner);
                    sendResponse({Result: res});
                    return true;
                });
                return true;
            });
            return true;
        }

        else if (request.Action === "SaveCircles") {
            var ls=localStorage.getItem("QS.AllCircles");
            if (ls===undefined || ls===null||ls==="undefined") {
                ls=JSON.stringify({});
            }
            var circleSettings=JSON.parse(ls);
            circleSettings.Circles=request.Circles;
            localStorage.setItem("QS.AllCircles", JSON.stringify(circleSettings));
        }
        else if (request.Action==="SaveCommunities") {
            var ls=localStorage.getItem("QS.AllCircles");
            if (ls===undefined || ls===null||ls==="undefined") {
                ls=JSON.stringify({});
            }
            var circleSettings = JSON.parse(ls);
            circleSettings.Communities = request.Communities;
            localStorage.setItem("QS.AllCircles", JSON.stringify(circleSettings));
        }
    }
);

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


// Icon in der Adressleiste von Chrome anzeigen
chrome.extension.onMessage.addListener(function(request, sender) {
    if (request === "show_page_action") {
        chrome.pageAction.show(sender.tab.id);
    }
});

// Trophies
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    
    if (request.Action==="getTrophyUsers") {
        var users;
        var file="http://www.trophies.at/php/getusers.php?version=1.0";
         $.ajax({
            url: file,
            dataType: 'json',
            async: false,
            success: function(data) {
                users=data;
            }
        });       
        sendResponse({Result: users});
    } else if (request.Action==="getTrophyDescriptions") {
        var trophynames;
        var file="http://www.trophies.at/js/trophy."+request.Language+".json";
        $.ajax({
            url: file,
            dataType: 'json',
            async: false,
            success: function(data) {
                trophynames=data;
            }
        });
        sendResponse({Result: trophynames});
    } else if (request.Action==="getTrophiesForUser") {
        var trophies;
        var file="http://www.trophies.at/php/loadtrophies.php?version=1.0&userId="+request.UserId;
        $.ajax({
            url: file,
            dataType: 'json',
            async: false,
            success: function(data) {
                trophies=data;
            }
        });
        sendResponse({Result: trophies});
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

            else if (request.Action === "LoadTicks")
            {
                var ticks = localStorage.getItem("Ticks");
                 
                sendResponse({
                   
                    Ticks: ticks,
                    Result: "Settings loaded."
                });
            }
            else if (request.Action==="CreateContextMenu") {
                CreateContextMenu();
                sendResponse({Result: "ContextMenu Created"});
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
            else if (request.Action==="ClearTicks") {
                localStorage.removeItem("Ticks");
                var allTicks=[];
                localStorage.setItem("Ticks",JSON.stringify(allTicks));
            }
           
            else if (request.Action==="EndTick") {
                var oldTicks=localStorage.getItem("Ticks");
                if (oldTicks!==undefined) {
                    var oldTicks = JSON.parse(oldTicks);
                    oldTicks.push({Name:request.Name, Time:request.Time, IsInit:request.IsInit,  Type:"STOPP"});
                    localStorage.setItem("Ticks",JSON.stringify(oldTicks));                 
                }
            }
            else if (request.Action==="GetTicks") {
                var ticks = JSON.parse(localStorage.getItem("Ticks"));
                 sendResponse({
                    TIcks: ticks
                });
            }
        }
);


function onClickHandler(info, tab) {
    if (info.menuItemId === 'hashtagfilter') {
        var tag = decodeURIComponent(info.linkUrl.replace('https://plus.google.com/s/', '').replace('https://plus.google.com/explore/', ''));
        addHashtag(tag);
    } else if (info.menuItemId === 'keywordfilter') {
        var keywords = info.selectionText.split(/[^\w\d]+/);
        addKeyword(keywords);
    }
}


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
