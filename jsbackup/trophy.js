
var counter = 0;
var oldestDate;
var lastDate = null;
var continous = 0;
var maxContinous = 0;
var messageCount = 0;
var postCount = 0;
var checkinCount = 0;
var shareCount = 0;
var maxShares = 0;
var maxPlus = 0;
var maxComments = 0;
var trophyList = [];
var continousStart = null;
var one_day = 1000 * 60 * 60 * 24;
var hasBild = false;
var circleCounter = 0;
var trekkieCount = 0;

function OptStartTrophies() {
    $(document).ready(function() {
        $('#collectTrophy').click(function()
        {
            if (!$('.trophyDiv').is(":visible"))
            {
                GetAuth();
                return false;
            }
        });

        $('#whyAuth').click(function()
        {
            $('.trophyDivWhy').fadeToggle();
            return false;
        });

        $('#closeInfo').click(function()
        {
            $('.trophyDivWhy').fadeOut();
            return false;
        });
    });
}



function GetAuth()
{
    chrome.runtime.sendMessage(
            {
                Action: "GetToken"
            }, function(response)
    {
        try {
            var token = response.Result;

            if (token === null || token === undefined) {
                // und tschüss
                alert("no token");
            }
            $('.trophyDiv').fadeIn();
            console.log("token=" + token);
            GetCircleStatistics(null, token);
            $('#collectTrophy').fadeOut();
        } catch (ex) {
            console.log(ex);
            return false;
        }
    });
    return false;
}

/**
 * Trophy speichern, wenn text vorhanden
 * @param {string} haystack zu durchsuchender string
 * @param {string} needle suchtext
 * @param {string} trophy Trophäe
 */
function CA2T(haystack, needle, trophy)
{
    if (haystack.indexOf(needle) >= 0) {
        A2T(trophy);
    }
}

/**
 * Kontaktdaten lesen
 * @param {string} pageToken Seiten-ID
 * @param {string} authToken Authentifizierung 
 */
function GetCircleStatistics(pageToken, authToken)
{
    try {
        $('#currentAction').html(chrome.i18n.getMessage("ReadingCircleData"));
        if (pageToken === undefined || pageToken === null) {
            pageToken = "";
        }
        var url = "https://www.googleapis.com/plus/v1/people/me/people/visible?maxResults=100&fields=items(displayName%2Cid)%2CtotalItems%2CnextPageToken&access_token=" + authToken + "&pageToken=" + pageToken;
        var totalCircles;

        $.getJSON(url, function(data)
        {
            totalCircles = data.totalItems;
            circleCounter++;
            for (var i in data.items)
            {
                try {
                    var item = data.items[i];
                    var id = item.id;
                    var name = item.displayName;
                    CA2T(name, "Union Berlin", "bronzeEisern");
					CA2T(name, "Pauli", "goldPauli");
                    CA2T(name, "Der Postillon", "bronzeFun");
                    CA2T(name, "The Onion", "bronzeFun");
                    CA2T(name, "Titanic", "bronzeFun");
                    CA2T(name, "Schön doof", "bronzeFun");
                    CA2T(name, "Daily Show", "bronzeFun");

                    if (name.indexOf("Jeri Ryan") >= 0) {
                        trekkieCount++;
                    }
                    if (name.indexOf("William Shatner") >= 0) {
                        trekkieCount++;
                    }
                    if (name.indexOf("Kate Mulgrew") >= 0) {
                        trekkieCount++;
                    }
                    if (name.indexOf("George Takei") >= 0) {
                        trekkieCount++;
                    }
                    if (name.indexOf("Wil Wheaton") >= 0) {
                        trekkieCount++;
                    }
                    if (trekkieCount >= 3) {
                        A2T("goldTrekkie");
                    }

                    CA2T(name, "Bryan Cranston", "silberBreaking");
                    CA2T(name, "Aaron Paul", "silberBreaking");
                    CA2T(name, "Anna Gunn", "silberBreaking");
                    CA2T(name, "RJ Mitte", "silberBreaking");
                    CA2T(name, "Betsy Brandt", "silberBreaking");
                    CA2T(name, "Bob Odenkirk", "silberBreaking");


                    CA2T(name, "Bob Odenkirk", "bronzeSaul");
                    CA2T(name, "Aaron Paul", "bronzeBitch");

                    CA2T(name, "Alan Alda", "silberMash");
                    CA2T(name, "Loretta Swit", "silberMash");
                    CA2T(name, "Mike Farrell", "silberMash");
                    CA2T(name, "Jamie Farr", "silberMash");
                    CA2T(name, "William Christopher", "silberMash");
                    CA2T(name, "David Ogden Stiers", "silberMash");
                    CA2T(name, "Wayne Rogers", "silberMash");
                    CA2T(name, "McLean Stevenson", "silberMash");
                    CA2T(name, "Gary Burghoff", "silberMash");
                    CA2T(name, "Larry Linville", "silberMash");

                    CA2T(name, "John Cleese", "bronzePython");
                    CA2T(name, "Eric Idle", "bronzePython");
                    CA2T(name, "Terry Gilliam", "bronzePython");
                    CA2T(name, "Terry Jones", "bronzePython");
                    CA2T(name, "Graham Chapman", "bronzePython");
                    CA2T(name, "Michael Palin", "bronzePython");

                    CA2T(name, "Eva Habermann", "bronzeLexx");
                    CA2T(name, "Michael McManus", "bronzeLexx");
                    CA2T(name, "Brian Downey", "bronzeLexx");

                    CA2T(name, "Jake Gyllenhaal", "bronzeDarko");
                    CA2T(name, "Jena Malone", "bronzeDarko");
                    CA2T(name, "Maggie Gyllenhaal", "bronzeDarko");
                    CA2T(name, "Drew Barrymore", "bronzeDarko");
                    CA2T(name, "Patrick Swayze", "bronzeDarko");
                    CA2T(name, "Daveigh Chase", "bronzeDarko");
                    CA2T(name, "Mary McDonnell", "bronzeDarko");
                    CA2T(name, "Seth Rogen", "bronzeDarko");
                    CA2T(name, "James Duval", "bronzeDarko");
                    CA2T(name, "Noah Wyle", "bronzeDarko");
                    CA2T(name, "Katharine Ross", "bronzeDarko");
                    CA2T(name, "Jerry Trainor", "bronzeDarko");
                    CA2T(name, "Holmes Osborne", "bronzeDarko");
                    CA2T(name, "Ashley Tisdale", "bronzeDarko");
                    CA2T(name, "Beth Grant", "bronzeDarko");
                    CA2T(name, "Fran Kranz", "bronzeDarko");
                    CA2T(name, "Jolene Purdy", "bronzeDarko");
                    CA2T(name, "Patience Cleveland", "bronzeDarko");

                    if (id === "114953790992839012570") {
                        hasBild = true;
                    }
                } catch (ex) {
                    console.log(ex);
                }
            }
            var readedUsers = circleCounter * 100;
            if (readedUsers > totalCircles)
            {
                readedUsers = totalCircles;
            }
            $('#currentPos').html(chrome.i18n.getMessage("ReadingCircleUsers") + " " + readedUsers + "/" + totalCircles);


            $('#trophyCount').html(trophyList.length + " " + chrome.i18n.getMessage("TrophiesCollected") + "<br/>");
            if (data.nextPageToken !== null && data.nextPageToken !== undefined && data.nextPageToken !== "")
            {
                GetCircleStatistics(data.nextPageToken, authToken);
            } else
            {
                CollectCircleStatisticsFinal(authToken);
            }
        });
    } catch (ex) {
        console.log(ex);
    }
}

/**
 * Trophäen speichern
 */
function SaveTrophies() {
    try {
        var newTrophies;
        var oldTrophies = localStorage.getItem("trophies");
        oldTrophies = oldTrophies || null;
        if (oldTrophies !== null)
        {
            newTrophies = JSON.parse(oldTrophies);
            for (var newI in trophyList)
            {
                if (newTrophies.indexOf(trophyList[newI]) < 0)
                {
                    newTrophies.push(trophyList[newI]);
                }
            }
        } else {
            newTrophies = trophyList;
        }

        localStorage.setItem("trophies", JSON.stringify(newTrophies));
        localStorage.setItem("lastTrophyRead", Date.today().toISOString());
    } catch (ex) {
        console.log(ex);
    }

}
/**
 * Finale Kontakt-Trophies
 * @param {string} token Auth-Token
 */
function CollectCircleStatisticsFinal(token)
{
    if (!hasBild) {
        A2T("goldBild");
    }
    GetActivityStatistics(null, token);
}


/**
 * Aktivitäts-Trophies sammeln
 * @param {string} pageToken Page-ID
 * @param {string} authToken Auth
 */
function GetActivityStatistics(pageToken, authToken)
{
    oldestDate = Date.today();
    try {
        $('#currentAction').html(chrome.i18n.getMessage("ReadingPublicStream"));
        if (pageToken === undefined || pageToken === null) {
            pageToken = "";
        }

        var url = "https://www.googleapis.com/plus/v1/people/me/activities/public?fields=items(annotation%2Cobject(content%2Cplusoners%2FtotalItems%2Creplies%2FtotalItems%2Cresharers%2FtotalItems)%2Cpublished%2Cverb)%2CnextPageToken&maxResults=100&access_token=" + authToken + "&pageToken=" + pageToken;
        $.getJSON(url, function(data)
        {

            if (data.items.length > 0)
            {
                for (var i in data.items)
                {
                    try {
                        var item = data.items[i];
                        // Counts:
                        messageCount++;
                        if (item.verb === "share")
                        {
                            shareCount++;
                        } else if (item.verb === "post") {
                            postCount++;
                        } else if (item.verb === "checkin") {
                            checkinCount++;
                        } else
                        {
                            consolte.log("unknown verb:" + item.verb);
                        }

                        // Datumsfunktionen:
                        var itemDate = Date.parse(item.published.split('.')[0]);

                        if (lastDate !== null)
                        {
                            diff = Math.ceil((lastDate - itemDate) / (one_day));
                            if (diff > 1)
                            {
                                if (continousStart !== null)
                                {
                                    continous = Math.ceil((continousStart - itemDate) / (one_day));
                                    if (continous > maxContinous) {
                                        maxContinous = continous;
                                    }
                                }
                                continousStart = itemDate;
                            }
                        } else
                        {
                            continousStart = itemDate;
                        }
                        lastDate = itemDate;
                        // Maximalwerte:
                        var replies = JSON.parse(item.object.replies.totalItems);
                        var shares = JSON.parse(item.object.resharers.totalItems);
                        var plusses = JSON.parse(item.object.plusoners.totalItems);
                        var twoWeeks = Date.today();
                        twoWeeks.add(-2).weeks();
                        if (itemDate < twoWeeks) {
                            if (replies === 0 && shares === 0 && plusses === 0) {
                                A2T("bronzeBoring");
                            }
                        }
                        if (replies > maxComments)
                        {
                            maxComments = replies;
                        }
                        if (shares > maxShares)
                        {
                            maxShares = shares;
                        }
                        if (plusses > maxPlus) {
                            maxPlus = plusses;
                        }

                        // Content:
                        var currentPost = "";
                        if (item.verb === "share") {
                            currentPost += item.annotation + " ";
                        }
                        currentPost += item.object.content;
                        if (itemDate.month === 5 && itemDate.day === 25)
                        {
                            CA2T(currentPost, "#towelday", "goldTowel");
                        }
                        if ((currentPost.indexOf("3,14") >= 0 || currentPost.indexOf("3.14") >= 0) && itemDate.month === 3 && itemDate.day === 14)
                        {
                            CA2T(currentPost, "3.14", "silberPi");
                            CA2T(currentPost, "3,14", "silberPi");
                        }
                        if (itemDate.month === 9 && itemDate.month === 19) {
                            CA2T(currentPost, "Avast", "silberPirate");
                            CA2T(currentPost, "Ayy", "silberPirate");
                            CA2T(currentPost, "Arrr", "silberPirate");
                            CA2T(currentPost, "Ahoi", "silberPirate");
                        }
                        CA2T(currentPost, "#fairphone", "silberFairphone");
                        CA2T(currentPost, "#caturday", "bronzeCat");
                        CA2T(currentPost, "#tgif", "bronzeTgif");
                        CA2T(currentPost, "Döner", "bronzeDoener");
                        CA2T(currentPost, "döner", "bronzeDoener");
                        CA2T(currentPost, "<i>", "bronzeItalic");
                        CA2T(currentPost, "<b>", "bronzeBold");
                        CA2T(currentPost, "<s>", "bronzeStrike");
                        CA2T(currentPost, "Moin", "bronzeNorddeutsch");
                        CA2T(currentPost, "moin", "bronzeNorddeutsch");
                        CA2T(currentPost, "Justin Bieber", "bronzeJustin");
                        CA2T(currentPost, "#justinbieber", "bronzeJustin");

                        if (itemDate.is().friday() && itemDate.getHours() > 22) {
                            A2T("bronzeNerd");
                        }

                        if (itemDate !== null && itemDate !== undefined) {
                            oldestDate = itemDate;
                        }
                    } catch (ex) {
                        console.log(ex);
                    }
                }
            }
            if (itemDate !== null && itemDate !== undefined) {
                $('#currentPos').html(chrome.i18n.getMessage("ReadingDataFrom") + " " + itemDate.toString("d.M.yyyy h:mm"));
                $('#trophyCount').html(trophyList.length + " " + chrome.i18n.getMessage("TrophiesCollected") + "<br/>");
            }
            if (data.nextPageToken !== null && data.nextPageToken !== undefined && data.nextPageToken !== "")
            {
                GetActivityStatistics(data.nextPageToken, authToken);
            } else
            {
                CollectStatisticsFinal();
                return oldestDate;
            }
            counter++;

            console.log(counter + " " + pageToken);
        });
    } catch (ex) {
        console.log(ex);
    }
}

/**
 * Trophäe speichern, wenn nicht vorhanden
 * @param {string} value zu speichernder Wert
 */
function A2T(value)
{
    if (trophyList.indexOf(value) >= 0)
    {
        return;
    }
    trophyList.push(value);
}

/**
 * Abschließendes Speichern der Trophäen, Stream
 *
 */
function CollectStatisticsFinal()
{
    if (maxShares >= 10)
    {
        A2T("bronzeShare");
        if (maxShares >= 50)
        {
            A2T("silberShare");
            if (maxShares >= 250)
            {
                A2T("goldShare");
            }
        }
    }

    if (maxPlus >= 20)
    {
        A2T("bronzePlus");
        if (maxPlus >= 200)
        {
            A2T("silberPlus");
            if (maxPlus >= 500) {
                A2T("goldPlus");
            }
        }
    }
    if (maxComments >= 10)
    {
        A2T("bronzeComment");
        if (maxComments >= 50)
        {
            A2T("silberComment");
            if (maxComments >= 500)
            {
                A2T("goldComment");
            }
        }
    }

    if (oldestDate <= Date.today().add(-1).months())
    {
        A2T("bronzeOld");
        if (oldestDate <= Date.today().add(-1).years())
        {
            A2T("silberOld");
            if (oldestDate <= Date.today().add(-2).years())
            {
                A2T("goldOld");
            }
        }
    }
    if (oldestDate.getFullYear() <= 2011)
    {
        A2T("goldAdopt");
    }
    if (maxContinous >= 30)
    {
        A2T("bronzeSteady");
        if (maxContinous >= 90) {
            A2T("silberSteady");
        }
    }

    if (postCount >= 250) {
        A2T("bronzePost");
        if (postCount >= 1000) {
            A2T("silberPost");
            if (postCount >= 5000) {
                A2T("goldPost");
            }
        }
    }

    $('#currentDate').val(chrome.i18n.getMessage("done"));
    SaveTrophies();
    $('.trophyDiv').hide();

}

/**
 * Profildaten lesen 
 * @param {string} authToken Auth
 */
function GetStatisticsProfile(authToken)
{
    try {
        $('#currentAction').html(chrome.i18n.getMessage("ReadingProfileData"));

        var url = "https://www.googleapis.com/plus/v1/people/me?access_token=" + authToken;
        $.getJSON(url, function(data)
        {
            var completeTag = data.tagline + " " + data.braggingRights + " " + data.aboutMe;
            CA2T(completeTag, "Weltherrschaft", "goldBrain");
            CA2T(completeTag, "world domination", "goldBrain");
            CA2T(data.relationshipStatus, "its_complicated", "bronzeSchwierig");
            CA2T(data.id, "109932908573405797116", "goldDev");
            CA2T(data.url, "/+", "bronzeVanity");

            var circledBy = data.circledByCount;
            if (circledBy >= 200)
            {
                A2T("bronzeFriends");
                if (circledBy >= 2000) {
                    A2T("silberFriends");
                    if (circledBy >= 5000) {
                        A2T("goldFriends");
                    }
                }
            }

            for (var i in data.urls)
            {
                var url = data.urls[i].value;

                CA2T(url, "startnext", "goldSupport");
                CA2T(url, "kickstarter", "silberKickstarter");
                CA2T(url, "111606711991143283422", "silberOptimizer");
                CA2T(url, "109839149408899563786", "silberOptimizer");
                CA2T(url, "xing", "bronzeXing");
                CA2T(url, "stack", "bronzeProgger");
            }
            for (var i in data.placesLived)
            {
                var place = data.placesLived[i].value;
                CA2T(place, "Hamburg", "bronzeHH");
            }
            GetActivityStatistics(null, authToken);
        });
    } catch (ex) {
        console.log(ex);
    }
}



