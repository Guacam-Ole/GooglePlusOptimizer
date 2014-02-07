
function StartSoccer()
{
    try
    {
        if (soccer === null || soccer === undefined)
        {
            return;
        }

        var soccerSetting = JSON.parse(soccer);
        enabledSoccer = new Array();
        for (var i in soccerSetting)
        {
            var setting = soccerSetting[i];
            if (setting.Position >= 0)
            {
                enabledSoccer.push(setting);

                var id = setting.Sport + "-" + setting.League + "-" + setting.Season;
                CreateBlock(parseInt(setting.Position) + 1, "soccer" + id);
            }
        }

        PingSoccer();
    } catch (ex) {
        console.log(ex);
    }
}

var soccerInterval;

// Fußball-Block aktualisieren
function PingSoccer()
{
    if (enabledSoccer === null || enabledSoccer === undefined)
    {
        return;
    }
    for (var i in enabledSoccer)
    {
        var setting = enabledSoccer[i];
        var id = setting.Sport + "-" + setting.League + "-" + setting.Season;
        UpdateSoccer("soccer" + id, setting.League, setting.Season);
    }
    if (soccerInterval === null || soccerInterval===undefined) 
    {
        soccerInterval = setInterval(function()
        {
            PingSoccer();
        }, 60000);
    }
}

var enabledSoccer;



// Fußball-Widget füllen
function UpdateSoccer(id, league, season)
{
    try
    {
        console.log("fussi update");

        var smallCompleteUrl = "http://www.nocarrier.de/opendb.php?command=GetCurrentGroup&league=" + league;
        $.getJSON(smallCompleteUrl, function(data)
        {
            console.log("loaded day");
            orderId = data.groupOrderID;


            var completeUrl = "http://www.nocarrier.de/opendb.php?command=GetResults&league=" + league + "&season=" + season + "&orderId=" + orderId;
            $.getJSON(completeUrl, function(data)
            {
                var header = "<div class=\"Ee fP Ue\" role=\"article\">"
                        + "<div class=\"a5 Gi\"><h3 class=\"EY Ni zj\"><span>Liveticker</span></h3><br/>__league__ <br/>__orderId__</div><div class=\"B3 Kg\">";
                //+ "<table width=\"100%\"><tbody>";
                var footer = "<sup><br>" + chrome.i18n.getMessage("ligaVon") + "<a href=\"http://www.openligadb.de/\">OpenLigaDB</a> </sup></div></div>";
                var output = "";
                header = header.replace("__league__", league = data.Matchdata[0].leagueName).replace("__orderId__", data.Matchdata[0].groupName);
                for (var i in data.Matchdata)
                {
                    var leftGoals = data.Matchdata[i].pointsTeam1;
                    var rightGoals = data.Matchdata[i].pointsTeam2;
                    if (leftGoals < 0)
                    {
                        leftGoals = 0;
                        rightGoals = 0;
                    }
                    var isActive = false;
                    var matchStart = data.Matchdata[i].matchDateTime;
                    var isRunning = false;
                    if (!data.Matchdata[i].matchIsFinished)
                    {
                        var nuAber = Date.now();
                        var gameTime = Date.parse(matchStart);
                        var isRunning = gameTime <= nuAber;
                    }
                    var color = isRunning ? "#FF0000" : "#000000";
                    output +=
                            soccerResult
                            .replace("__imgLeft__", data.Matchdata[i].iconUrlTeam1).replace("__teamLeft__", data.Matchdata[i].nameTeam1).replace("__goalsLeft__", leftGoals)
                            .replace("__imgRight__", data.Matchdata[i].iconUrlTeam2).replace("__teamRight__", data.Matchdata[i].nameTeam2).replace("__goalsRight__", rightGoals)
                            .replace("__color__", color).replace("__color__", color);
                    var goalLine = "";
                    var oldResult = "0:0";
                    for (var g in data.Matchdata[i].goals.Goal)
                    {
                        var oneGoal = data.Matchdata[i].goals.Goal[g];
                        if (oneGoal !== null && oneGoal !== "undefined" && oneGoal.hasOwnProperty("goalID"))
                        {
                            try {

                                if (oneGoal.goalMatchMinute === null || oneGoal.goalMatchMinut === undefined)
                                {
                                    oneGoal.goalMatchMinute = "";
                                }

                                if (oneGoal.goalGetterName === null || oneGoal.goalGetterName === undefined)
                                {
                                    oneGoal.goalGetterName = "";
                                }

                                var oldRight = 0;
                                var pos = "Left";
                                if (oldResult.indexOf(":") > 0)
                                {
                                    var oldLeft = JSON.parse(oldResult.split(":")[0]);
                                    var oldRight = JSON.parse(oldResult.split(":")[1]);

                                    if (oneGoal.goalScoreTeam2 > oldRight)
                                    {
                                        pos = "Right";
                                    }
                                    oldResult = oneGoal.goalScoreTeam1 + ":" + oneGoal.goalScoreTeam2;
                                }
                                var addInfo = "";
                                if (oneGoal.goalPenalty)
                                {
                                    addInfo = " (FE)";
                                }
                                else if (data.Matchdata[i].goals.Goal[g].goalOwnGoal)
                                {
                                    addInfo = " (ET)";
                                }
                                else if (data.Matchdata[i].goals.Goal[g].goalOvertime)
                                {
                                    addInfo = " (nV)";
                                }
                                goalLine += soccerGoalResult
                                        .replace("__minute__", oneGoal.goalMatchMinute)
                                        .replace("__goalsLeft__", oneGoal.goalScoreTeam1)
                                        .replace("__goalsRight__", oneGoal.goalScoreTeam2)
                                        .replace("__player__", oneGoal.goalGetterName)
                                        .replace("__addInfo__", addInfo)
                                        .replace("__ORI__", pos);
                            } catch (ex)
                            {
                                console.log(ex);
                            }
                        }
                    }
                    output += soccerGoalTop;
                    if (goalLine !== "")
                    {
                        output += goalLine;
                    }
                    output += soccerGoalBottom;
                }
                sportbox = header + soccerTop + output + soccerBottom + footer;
                $('#' + id).html(sportbox);
                CreateSportClickEvent();

            });
        });
    } catch (ex)
    {
        console.log(ex);
    }
}


function CreateSportClickEvent()
{
    $(".NeuesVomSpocht tr:odd").addClass("odd");
    $(".NeuesVomSpocht tr:not(.odd)").hide();
    $(".NeuesVomSpocht tr:first-child").show();

    $(".NeuesVomSpocht tr.odd").click(function() {
        $(this).next("tr").toggle();
        $(this).find(".arrow").toggleClass("up");
    });
}



var soccerTop = "<table class=\"NeuesVomSpocht\" width=\"100%\">"
        + "<tr><th align=\"left\">" + chrome.i18n.getMessage("Heimmannschaft") + "</th><th align=\"center\">" + chrome.i18n.getMessage("Stand") + "</th><th align=\"right\">" + chrome.i18n.getMessage("Gaestemannschaft") + "</th><th></th></tr>";
var soccerResult = "<tr>"
        + "<td align=\"left\"><img alt=\"Heimlogo\" width=\"20\" height=\"20\" src=\"__imgLeft__\">&nbsp;__teamLeft__</td>"
        + "<td align=\"center\"><font color=\"__color__\">__goalsLeft__ : __goalsRight__</font></td>"
        + "<td align=\"right\">__teamRight__&nbsp;<img alt=\"Gästelogo\" src=\"__imgRight__\"></td>"
        + "<td><div class=\"arrow\"></div></td>"
        + "</tr>";

var soccerGoalTop = "<tr><td colspan=\"3\"><div class=\"goals\">";
var soccerGoalBottom = "</div></td></tr>";
var soccerBottom = "</table></div>";

var soccerGoalResult = "<div class=\"goal__ORI__\">"
        + "<span class=\"goalImage\"><img src=\"" + chrome.extension.getURL('setup/images/tor.png') + "\"/></span>"
        + "<span class=\'goalMin\'>__minute__&nbsp;</span>"
        + "<span class=\"goalResult\">__goalsLeft__ : __goalsRight__</span>"
        + "<span class=\"player\">__player__&nbsp;__addInfo__</span></div>";
        