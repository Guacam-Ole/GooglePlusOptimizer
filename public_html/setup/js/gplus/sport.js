var gpoSport = function () {
    this.Interval = null;
    this.Settings;
    this.EnabledSoccer;

    this.Top = "<table class=\"NeuesVomSpocht\" width=\"100%\">"
            + "<tr><th align=\"left\">" + chrome.i18n.getMessage("Heimmannschaft") + "</th><th align=\"center\">" + chrome.i18n.getMessage("Stand") + "</th><th align=\"right\">" + chrome.i18n.getMessage("Gaestemannschaft") + "</th><th></th></tr>";
    this.Result = "<tr class='teams'>"
            + "<td align=\"left\"><img alt=\"Heimlogo\" width=\"20\" height=\"20\" src=\"__imgLeft__\">&nbsp;__teamLeft__</td>"
            + "<td align=\"center\"><font color=\"__color__\">__goalsLeft__ : __goalsRight__</font></td>"
            + "<td align=\"right\">__teamRight__&nbsp;<img alt=\"Gästelogo\" src=\"__imgRight__\"></td>"
            + "<td><div class=\"arrow\"></div></td>"
            + "</tr>";

    this.GoalTop = "<tr><td colspan=\"3\"><div class=\"goals\">";
    this.GoalBottom = "</div></td></tr>";
    this.Bottom = "</table></div>";

    this.GoalResult = "<div class=\"goal__ORI__\">"
            + "<span class=\"goalImage\"><img src=\"" + chrome.extension.getURL('setup/images/tor.png') + "\"/></span>"
            + "<span class=\'goalMin\'>__minute__&nbsp;</span>"
            + "<span class=\"goalResult\">__goalsLeft__ : __goalsRight__</span>"
            + "<span class=\"player\">__player__&nbsp;__addInfo__</span></div>";
    this.Header = "<div class=\"Ee fP Ue\" role=\"article\">"
            + "<div class=\"a5 Gi\"><h3 class=\"EY Ni zj\"><span>Liveticker</span></h3><br/>__league__ <br/><a class='changeDay' data-day='__PREV__'>⇐</a><span>__orderId__</span><a class='changeDay' data-day='__NEXT__'>⇒</a></div><div class=\"B3 Kg\">";
    this.Footer = "<sup><br>" + chrome.i18n.getMessage("ligaVon") + "<a href=\"http://www.openligadb.de/\">OpenLigaDB</a> </sup></div></div>";
    this.Days = [];
};

var enabledSoccer;
var soccerInterval;

gpoSport.prototype = {
    constructor: gpoSport,
    Init: function () {
        this.CreateEvents();
        $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("./setup/css/sport.css") + "' type='text/css' media='screen' />"));
        this.StartSoccer();
    },
    Dom: function () {
        this.Draw();
    },
    StartSoccer: function () {
        var obj = this;

        obj.EnabledSoccer = new Array();
        for (var i in obj.Settings)
        {
            var setting = obj.Settings[i];
            if (setting.Position >= 0)
            {
                obj.EnabledSoccer.push(setting);
            }
        }
        obj.Draw();
        obj.PingSoccer();
    },
    Draw: function () {
        var obj = this;
        for (var i in obj.EnabledSoccer) {
            var setting = obj.EnabledSoccer[i];
            var id = setting.Sport + "-" + setting.League + "-" + setting.Season;
            var totalId="#soccer"+id;
            if ($(totalId).length === 0) {
                CreateBlock(parseInt(setting.Position) + 1, "soccer" + id);
            }
        }
    },
    PingSoccer: function () {
        var obj = this;
        for (var i in obj.EnabledSoccer)
        {
            var setting = obj.EnabledSoccer[i];
            var id = setting.Sport + "-" + setting.League + "-" + setting.Season;
            obj.UpdateSoccer("soccer" + id, setting.League, setting.Season);
        }
        if (obj.Interval === null || obj.Interval === undefined) {
            obj.Interval = setInterval(function ()
            {
                obj.PingSoccer();
            }, 60000);
        }
    },
    UpdateFromIdOnly: function (id, day) {
        var allElements = id.split('-');
        this.UpdateSoccer(id, allElements[1], allElements[2], day);
        this.Days[id] = day;
    },
    UpdateSoccer: function (id, league, season, day) {
        
        
        var obj = this;
        
        var output = "";
        if (day === undefined) {
            day = null;
        }
        if (day === null && obj.Days[id] !== undefined) {
            day = obj.Days[id];
        }

        chrome.runtime.sendMessage({
            Action: "GetSoccerScores",
            League: league,
            Season: season,
            Day: day
        }, function (response)
        {
            console.log("fussi update");
            domChangeAllowed=false;
            var data = JSON.parse(response.Result);
            var firstMatch;
            if (data !== null && data !== undefined && data.Matchdata.length > 0) {
                firstMatch = data.Matchdata[0];
            } else {
                return;
            }

            var header = obj.Header.replace("__league__", league = firstMatch.leagueName).replace("__orderId__", firstMatch.groupName);
            var prev = 0;
            var next = 0;
            if (firstMatch.groupOrderID > 0) {
                next = firstMatch.groupOrderID + 1;
                prev = firstMatch.groupOrderID - 1;
            }
            header = header.replace("__PREV__", prev).replace("__NEXT__", next);
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
                        obj.Result
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
                        // try {

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
                        goalLine += obj.GoalResult
                                .replace("__minute__", oneGoal.goalMatchMinute)
                                .replace("__goalsLeft__", oneGoal.goalScoreTeam1)
                                .replace("__goalsRight__", oneGoal.goalScoreTeam2)
                                .replace("__player__", oneGoal.goalGetterName)
                                .replace("__addInfo__", addInfo)
                                .replace("__ORI__", pos);
                        /*} catch (ex)
                         {
                         console.log(ex);
                         }*/
                    }
                }
                output += obj.GoalTop;
                if (goalLine !== "")
                {
                    output += goalLine;
                }
                output += obj.GoalBottom;
            }

            var sportbox = header + obj.Top + output + obj.Bottom + obj.Footer;
            $('#' + id).html(sportbox);
            obj.HideDetails();
            AllowDomChange();
        });
    },
    CreateEvents: function () {
        var obj = this;

        $(document).on('click', '.NeuesVomSpocht tr.teams', function ()
        {
            $(this).next("tr").toggle();
            $(this).find(".arrow").toggleClass("up");
        });

        $(document).on('click', '.changeDay', function ()
        {
            var id = $(this).closest('.nja').attr('id');
            var day = $(this).data("day");
            if (day !== "0") {
                obj.UpdateFromIdOnly(id, day);
            }
            return false;
        });
    },
    HideDetails: function () {
        //$(".NeuesVomSpocht tr:odd").addClass("odd");
        $(".NeuesVomSpocht tr:not(.teams)").hide();
        //$(".NeuesVomSpocht tr:first-child").show();
    }
};
