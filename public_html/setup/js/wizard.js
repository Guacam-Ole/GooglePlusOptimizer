var allFilter;
var allWidgets;
var allSettings;
var allAdditions;
var currentStepId;

var allPages;
var wizardInitialized = false;

function OptStartWizard() {
    $(".make-switch").on('switch-change', function(e, data)
    {
        // console.log("switched class");
    });
    $(".make-switch").on('switch-change', function(e, data)
    {
        //console.log("switched class");
    });
}

/**
 * Prüfen, ob neue Optionen verfügbar sind
 * @param {string} lastwizard Versionsnummer des letzten aufrufs
 * @returns {Boolean} true, wenn Wizard angezeigt werden soll
 */
function NewWizardOptionsExist(lastwizard) {
    try {
        if (window.location.search.indexOf("displayWizard") > 0) {
            lastwizard = "0";
            chrome.runtime.sendMessage(
                    {
                        Action: "SaveWizardVersion",
                        ParameterValue: "0"}, function(response) {
            });
            return false;
        }
        lastwizard = lastwizard || "0";


        var manifest = chrome.runtime.getManifest();

        if (lastwizard === manifest.version) {
            return false;
        }
        var oldVersion = GetVersionLong(lastwizard);
        var newVersion = GetVersionLong(manifest.version);

        if (newVersion - oldVersion < 100) {
            // Nur bugfixes, keine Features
            return false;
        }
        return true;
    } catch (ex) {
        console.log(ex);
        return false;
    }
}

/**
 * Wizard initialisieren
 * @param {string} version Version des letzten Aufrufs
 * @returns {undefined}
 */
function InitWizard(version)
{
    try {
        if (wizardInitialized === true) {
            return;
        }
        $('[data-iid="wizard"]').fadeOut();
        wizardInitialized = true;
        var manifest = chrome.runtime.getManifest();
        chrome.runtime.sendMessage(
                {
                    Action: "SaveWizardVersion",
                    ParameterValue: manifest.version}, function(response) {
        });
        $('.make-switch').bootstrapSwitch();
        $('#nextSetting').click(function() {
            if (currentStepId !== allPages[allPages.length - 1]) {
                var pos = allPages.indexOf(currentStepId);

                $('#wr').find('.content').appendTo($('#' + currentStepId));
                DisplayStep(allPages[pos + 1], pos + 1, allPages.length - 2);
            }
            return false;
        });
        $('#prevSetting').click(function() {
            if (currentStepId !== allPages[0]) {
                var pos = allPages.indexOf(currentStepId);
                $('#wr').find('.content').appendTo($('#' + currentStepId));
                DisplayStep(allPages[pos - 1], pos - 1, allPages.length - 2);
            }
            return false;
        });


        $('#reloadPage').click(function() {
            window.location.reload(true);
        });
        version = version || "0";

        //var version = window.location.search.substring(1) || "0";


        allWidgets = CollectSteps("Widget", version);
        allAdditions = CollectSteps("Feature", version);
        allSettings = CollectSteps("Setting", version);
        allFilter = CollectSteps("Filter", version);

        allPages = [];
        allPages.push('Intro');
        for (var i in allFilter) {
            allPages.push(allFilter[i]);
        }
        for (var i in allWidgets) {
            allPages.push(allWidgets[i]);
        }
        for (var i in allAdditions) {
            allPages.push(allAdditions[i]);
        }
        for (var i in allSettings) {
            allPages.push(allSettings[i]);
        }
        allPages.push('Finish');
        var divWidth = $('.container').width();
        var spamWidth = $('.spam').width();

        var screenWidth = $(window).width();

        $('.container').offset({left: ((screenWidth - divWidth) / 2)});
        $('.spam').offset({left: ((screenWidth - spamWidth) / 2)});
        LoadWizardSettings();
        FillSportData();
        FillWeatherData();
        DisplayStep(allPages[0], 0, 0);
        handleTagsInput();
        $.get("http://www.nocarrier.de/optimizer.php", function(test) {
            if (test === true) {
                $('.spam').fadeIn();
            }
        });

        $('#robbe').attr('src', chrome.extension.getURL("setup/images/progress.gif"));
        WizSwitchEvents();
    } catch (ex) {
        console.log(ex);
    }
}

/**
 * Wettereisntellungen suchen
 */
function FillWeatherData() {
    $('.searchWeather').click(function()
    {
        try {
            var weather = $(this);
            var weatherCombo = weather.closest('.tableWeather').find('select.weatherType');
            var weatherInput = weather.closest('.tableWeather').find('input');
            weatherCombo.children().remove();
            var query = "select woeid, country,name, postal from geo.places where text=\"" + weatherInput.val() + "\"";
            var api = 'https://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent(query) + '&format=json';
            console.log("API:" + api);
            $.getJSON(api, function(data)
            {
                for (var i in data.query.results.place)
                {
                    var place = data.query.results.place[i];
                    var plz = place.postal;
                    if (plz === null || plz === undefined)
                    {
                        plz = "";
                    } else {
                        plz = plz.content;
                        if (plz === null || plz === undefined)
                        {
                            plz = "";
                        }
                    }
                    var entry = plz + " " + place.name + ", " + place.country.content;
                    var id = place.woeid;
                    weatherCombo.append("<option value='" + id + "'>" + entry + "</option>");
                }
            });
        } catch (ex) {
            console.log(ex);
        }
        return false;

    });
}

/**
 * Einstellungen für Wizard laden
 */
function LoadWizardSettings() {
    LoadCheckBox(filterPlus1, "#chkWizPlus1");
    LoadCheckBox(filterYouTube, "#chkWizYT");
    LoadCheckBox(whamWhamText, "#chkWhamText");
    LoadCheckBox(whamWhamLink, "#chkWhamUrl");
    LoadCheckBox(whamChristmasText, "#chkChristmasText");
    LoadCheckBox(whamChristmasLink, "#chkChristmasUrl");
    LoadCheckBox(filterHashTag, "#chkWizHashtag");
    LoadCheckBox(filterCustom, "#chkWizVolltext");
    LoadCheckBox(filterCommunity, "#chkWizCommunity");
    LoadCheckBox(filterBirthday, "#chkWizBirthday");
    LoadCheckBox(filterPersons, "#chkWizKnown");
    LoadCheckBox(filterImages, "#chkWizImage");
    LoadCheckBox(filterGifOnly, "#chkFilterGif");
    LoadCheckBox(filterVideo, "#chkWizVideo");
    LoadCheckBox(filterMp4Only, "#chkFilterMp4");
    LoadCheckBox(filterLinks, "#chkWizURL");
    LoadCheckBox(colorUsers, "#chkWizColors");
    LoadCheckBox(showEmoticons, "#chkWizEmoticons");

    propsFulltext = propsFulltext || "";
    if (propsFulltext === null) {
        propsFulltext = "";
    }
    $('#fulltext').val(propsFulltext);
    LoadWidgetData();
    LoadSport();
    LoadWeather();
}

/**
 * Einstellungen für Sportwidget
 * @returns {Boolean}
 */
function FillSportData()
{
    try {
        //GetAllSports
        $completeUrl = "http://www.nocarrier.de/opendb.php?command=GetAllSports";
        $.getJSON($completeUrl, function(data)
        {
            $('select.sportType').children().remove();
            $('select.sportType').append("<option value='null'>(bitte wählen)</option>");
            for (var i in data.Sport)
            {
                var id = data.Sport[i].sportsID;
                var name = data.Sport[i].sportsName;
                $('select.sportType').append("<option value='" + id + "'>" + name + "</option>");
            }
        });
        $('select.sportType').change(function()
        {
            var sport = $(this);
            var leagueCombo = sport.closest('.tableSport').find('select.sportLeague');
            $completeUrl = "http://www.nocarrier.de/opendb.php?command=GetLeagues&sport=" + $(this).val();
            $.getJSON($completeUrl, function(data)
            {
                leagueCombo.children().remove();
                var dictLeagues = {};
                var leagueNames = new Array();
                now = new Date();
                for (var i in data.League)
                {
                    var id = data.League[i].leagueShortcut;
                    var name = data.League[i].leagueName;
                    var league = JSON.parse(data.League[i].leagueSaison);
                    var savedYear = dictLeagues[id];
                    if (league === now.getFullYear() || league === now.getFullYear() - 1)
                    {
                        if (savedYear === null || savedYear === undefined || savedYear < league)
                        {
                            dictLeagues[id] = league;
                            leagueNames[id] = name;
                        }
                    }
                }
                for (var id in dictLeagues)
                {
                    leagueCombo.append("<option value='" + id + "|" + dictLeagues[id] + "'>" + leagueNames[id] + "</option>");
                }
            });
            leagueCombo.attr('disabled', false);
        });
    } catch (ex) {
        console.log(ex);
    }
    return false;
}

/**
 * Widget-Spalteneinstellungen
 */
function LoadWidgetData() {

    try {
        if (columnCount === null || columnCount === undefined)
        {
            columnCount = 3;
        } else {
            columnCount = JSON.parse(columnCount);
        }

        if ($('.sportPosition').length > 0)
        {
            $('.sportPosition').empty();
            $('.weatherPosition').empty();
            $('.clockPos').empty();
            $("<option/>").val(-1).text(chrome.i18n.getMessage("WidgetHide")).appendTo('.sportPosition');
            $("<option/>").val(-1).text(chrome.i18n.getMessage("WidgetHide")).appendTo('.weatherPosition');
            $("<option/>").val(-1).text(chrome.i18n.getMessage("WidgetHide")).appendTo('.clockPos');
            if (columnCount === 1)
            {
                $("<option/>").val(0).text(chrome.i18n.getMessage("WidgetShow")).appendTo('.sportPosition');
                $("<option/>").val(0).text(chrome.i18n.getMessage("WidgetShow")).appendTo('.weatherPosition');
                $("<option/>").val(0).text(chrome.i18n.getMessage("WidgetShow")).appendTo('.clockPos');
            }
            else if (columnCount === 2)
            {
                $("<option/>").val(0).text(chrome.i18n.getMessage("WidgetLeft")).appendTo('.sportPosition');
                $("<option/>").val(0).text(chrome.i18n.getMessage("WidgetLeft")).appendTo('.weatherPosition');
                $("<option/>").val(0).text(chrome.i18n.getMessage("WidgetLeft")).appendTo('.clockPos');
                $("<option/>").val(1).text(chrome.i18n.getMessage("WidgetRight")).appendTo('.sportPosition');
                $("<option/>").val(1).text(chrome.i18n.getMessage("WidgetRight")).appendTo('.weatherPosition');
                $("<option/>").val(1).text(chrome.i18n.getMessage("WidgetRight")).appendTo('.clockPos');

            } else
            {
                $("<option/>").val(0).text(chrome.i18n.getMessage("WidgetLeft")).appendTo('.sportPosition');
                $("<option/>").val(0).text(chrome.i18n.getMessage("WidgetLeft")).appendTo('.weatherPosition');
                $("<option/>").val(0).text(chrome.i18n.getMessage("WidgetLeft")).appendTo('.clockPos');
                $("<option/>").val(1).text(chrome.i18n.getMessage("WidgetMiddle")).appendTo('.sportPosition');
                $("<option/>").val(1).text(chrome.i18n.getMessage("WidgetMiddle")).appendTo('.weatherPosition');
                $("<option/>").val(1).text(chrome.i18n.getMessage("WidgetMiddle")).appendTo('.clockPos');
                $("<option/>").val(2).text(chrome.i18n.getMessage("WidgetRight")).appendTo('.sportPosition');
                $("<option/>").val(2).text(chrome.i18n.getMessage("WidgetRight")).appendTo('.weatherPosition');
                $("<option/>").val(2).text(chrome.i18n.getMessage("WidgetRight")).appendTo('.clockPos');
            }
        }
        $("#clockPos").val(clock);
    } catch (ex) {
        console.log(ex);
    }
}

/**
 * Wetter Wetter Wetter
 */
function LoadWeather()
{
    var weatherSetting = JSON.parse(wetter);
    for (var i in weatherSetting)
    {
        try {
            if (JSON.parse(i) === 0) {
                var u = parseInt(i) + 1;
                var setting = weatherSetting[i];
                var wPos = '#weather' + u + 'Pos';
                var wOrt = '#weather' + u + 'Ort';
                $(wPos).val(setting.Position);
                $(wOrt).children().remove();
                $(wOrt).append("<option value='" + setting.Id + "'>" + setting.Text + "</option>");
                $(wOrt).val(setting.Id);
            }
        } catch (ex) {
            console.log(ex);
        }
    }
}

/**
 * Sportdaten 
 */
function LoadSport()
{
    var sportSetting = JSON.parse(soccer);
    for (var i in sportSetting)
    {
        try {
            if (JSON.parse(i) === 0) {
                var u = parseInt(i) + 1;
                var setting = sportSetting[i];
                var sPos = '#sport' + u + 'Pos';
                var sSport = '#sport' + u + 'Sport';
                var sLeague = '#cmbLeague' + u;
                $(sPos).val(setting.Position);
                $(sSport).children().remove();
                $(sLeague).children().remove();
                $(sSport).append("<option value='" + setting.Sport + "'>" + setting.SportName + "</option>");
                $(sLeague).append("<option value='" + setting.League + "|" + setting.Season + "'>" + setting.LeagueName + "</option>");
                $(sSport).val(setting.Sport);
                $(sLeague).val(setting.League + "|" + setting.Season);
                $(sLeague).attr("disabled", "false");
            }
        } catch (ex) {
            console.log(ex);
        }
    }
}

/**
 * Version in Long-Wert wandeln
 * @param {string} version Versionsnummer
 * @returns {Number|GetVersionLong.version} Zahlenwert für Version
 */
function GetVersionLong(version) {
    var versionSplit = version.split('.');
    var versionLong = version[0] * 1000000;
    if (versionSplit.length > 1) {
        versionLong += versionSplit[1] * 10000;
    }
    if (versionSplit.length > 2) {
        versionLong += versionSplit[2] * 100;
    }
    if (versionSplit.length > 3) {
        versionLong += versionSplit[3];
    }
    return versionLong;
}

/**
 * Kacheln bestimmen
 * @param {string} category Kategorie
 * @param {string} version Version
 * @returns {CollectSteps.allSteps|Array} Kacheln
 */
function CollectSteps(category, version) {
    var allSteps = [];
    var minVersion = GetVersionLong(version);

    $('.wizardContainer').each(function() {
        var container = $(this);
        if (container.find('.category').text() === category &&
                GetVersionLong(container.find('.version').text()) >= minVersion)
        {
            allSteps.push(container.attr('id'));
        }
    });
    return allSteps;
}


/**
 * Switch-Events
 */
function WizSwitchEvents() {
    $(".make-switch").on('switch-change', function(e, data)
    {
        var id = $(this).attr("id");
        switch (id) {
            case "chkWizPlus1":
                filterPlus1 = data.value;
                break;
            case "chkWizYT":
                filterYouTube = data.value;
                break;
            case "chkWhamText":
                whamWhamText = data.value;
                break;
            case "chkWhamUrl":
                whamWhamLink = data.value;
                break;
            case "chkChristmasText":
                whamChristmasText = data.value;
                break;
            case "chkChristmasUrl":
                whamChristmasLink = data.value;
                break;
            case "chkWizHashtag":
                filterHashTag = data.value;
                break;
            case "chkWizVolltext":
                filterCustom = data.value;
                break;
            case "chkWizCommunity":
                filterCommunity = data.value;
                break;
            case "chkWizBirthday":
                filterBirthday = data.value;
                break;
            case "chkWizKnown":
                filterPersons = data.value;
                break;
            case "chkWizImage":
                filterImages = data.value;
                break;
            case "chkFilterGif":
                filterGifOnly = data.value;
                break;
            case "chkWizVideo":
                filterVideo = data.value;
                break;
            case "chkFilterMp4":
                filterMp4Only = data.value;
                break;
            case "chkWizURL":
                filterLinks = data.value;
                break;
            case "chkWizColors":
                colorUsers = data.value;
                break;
            case "chkWizEmoticons":
                showEmoticons = data.value;
                break;


        }
    });

    $('#clockPos').change(function()
    {
        clock = $("#clockPos").val();
    });
    SaveWizardSportSettings();
    SaveWizardWeatherSettings();
}

/**
 * Wettereinstellungen speichern
 * @returns {undefined}
 */
function SaveWizardWeatherSettings()
{
    $('#weather1Ort').change(function()
    {
        try {
            var weatherSetting = JSON.parse(wetter || null);

            var weather1Id = $('#weather1Ort').val();
            var weather1Name = $('#weather1Ort option:selected').text();
            var weather1Pos = $('#weather1Pos').val();
            var weather1 = {Position: weather1Pos, Id: weather1Id, Text: weather1Name};

            wetterA = new Array();
            wetterA.push(weather1);
            if (weatherSetting !== null && weatherSetting.length === 3) {
                wetterA.push(weatherSetting[1]);
                wetterA.push(weatherSetting[2]);
            } else {
                wetterA.push({Position: -1, Id: "", Text: ""});
                wetterA.push({Position: -1, Id: "", Text: ""});
            }
            wetter = JSON.stringify(wetterA);
            return false;
        } catch (ex) {
            console.log(ex);
        }
    });
}

/**
 * Sporteinstellungen speichern
 */
function SaveWizardSportSettings() {
    $('#cmbLeague1').change(function()
    {
        try {
            var sportSetting = JSON.parse(soccer || null);


            var sport1League = $('#cmbLeague1').val();
            var sport1Sport = $('#sport1Sport').val();
            var sport1Pos = $('#sport1Pos').val();
            if (sport1League === "null" || sport1League === undefined || sport1League === "")
            {
                sport1League = "|";
            }

            var sport1Season = sport1League.split("|")[1];
            var sport1League = sport1League.split("|")[0];
            var sport1LeagueName = $('#cmbLeague1 option:selected').text();
            var sport1SportName = $('#sport1Sport option:selected').text();
            var sport1 = {Position: sport1Pos, SportName: sport1SportName, Sport: sport1Sport, League: sport1League, Season: sport1Season, LeagueName: sport1LeagueName};
            soccerA = new Array();
            soccerA.push(sport1);
            if (sportSetting !== null && sportSetting.length === 3) {
                soccerA.push(sportSetting[1]);
                soccerA.push(sportSetting[2]);
            } else {
                soccerA.push({Position: -1, SportName: "", Sport: "", League: "", Season: "", LeagueName: ""});
                soccerA.push({Position: -1, SportName: "", Sport: "", League: "", Season: "", LeagueName: ""});
            }
            soccer = JSON.stringify(soccerA);
            return false;
        } catch (ex) {
            console.log(ex);
        }
    });
}

/**
 * Wizardeinstellungen speichern
 */
function SaveWizardSettings()
{
    trophies = localStorage.getItem("trophies");
    var lastTrophyRead = localStorage.getItem("lastTrophyRead");
    filterWham = whamWhamText || whamWhamLink || whamChristmasText || whamChristmasLink;
    showTrophies = trophies !== null && trophies !== undefined && trophies.length > 0;

    chrome.runtime.sendMessage(
            {
                Action: "SaveAll",
                plus1: filterPlus1,
                yt: filterYouTube,
                wham: filterWham,
                hashtag: filterHashTag,
                custom: filterCustom,
                community: filterCommunity,
                birthday: filterBirthday,
                known: filterPersons,
                fulltext: propsFulltext,
                WHAMWhamText: whamWhamText,
                WHAMWhamUrl: whamWhamLink,
                WHAMChristmasText: whamChristmasText,
                WHAMChristmasUrl: whamChristmasLink,
                StoppWatch: clock,
                Sport: soccer,
                Weather: wetter,
                colorUsers: colorUsers,
                filterImages: filterImages,
                filterVideo: filterVideo,
                filterGifOnly: filterGifOnly,
                filterMp4Only: filterMp4Only,
                displayTrophy: showTrophies,
                filterLinks: filterLinks,
                trophies: trophies,
                showEmoticons: showEmoticons,
                lastTrophyRead: lastTrophyRead
            }, function(response) {
    }
    );
}

/**
 * Kachel darstellen
 * @param {int} id zu zeigende Kachel
 * @param {int} current aktuelle Kachel
 * @param {int} max max. Kachel
 */
function DisplayStep(id, current, max) {
    try {
        current = current || 0;
        max = max || 0;

        $('#prevSetting').removeClass('wizActive wizInactive');
        $('#nextSetting').removeClass('wizActive wizInactive');

        if (id === allPages[0]) {
            // erste Seite
            $('#nextSetting').addClass("wizActive");
            $('#prevSetting').addClass("wizInactive");
        } else if (id === allPages[allPages.length - 1]) {
            // letzte Seite: 
            $('#nextSetting').addClass("wizInactive");
            $('#prevSetting').addClass("wizActive");
            SaveWizardSettings();
        } else {
            $('#nextSetting').addClass("wizActive");
            $('#prevSetting').addClass("wizActive");
        }
        var container = $('#' + id);
        currentStepId = id;

        var wizVersion = container.find('.version').text();
        var wizImage = container.find('.image').text();
        var wizCategory = container.find('.category').text();
        var wizHeader = container.find('.heading').text();

        var lang = chrome.i18n.getMessage("lang");
        $('.wizardImage img').attr('src', chrome.extension.getURL("setup/" + lang + "/wizimg/" + wizImage));
        $('.wizardRight h3').text(wizHeader);
        $('#wr').empty();

        container.find('.content').appendTo('#wr');
        if (wizCategory === "Other") {
            $('.imgTitle').hide();
            $('#wizardSubtitle').text("");
        } else {
            $('.imgTitle').show();
            $('#wizardSubtitle').text(wizCategory + " (" + current + " / " + max + ")");
        }
    } catch (ex) {
        console.log(ex);
    }
}

/**
 * Tags eingeben und entfernen (Volltextfilter)
 */
function handleTagsInput()
{
    if (!jQuery().tagsInput)
    {
        return;
    }
    $('#fulltext').tagsInput(
            {
                width: 'auto',
                'onAddTag': function()
                {
                    propsFulltext = $('#fulltext').val();
                },
                'onRemoveTag': function()
                {
                    // alert('YOUR DAMN RIGHT!');
                    propsFulltext = $('#fulltext').val();
                }
            });
}


/**
 * Checkboxeinstellung laden
 * @param {string} property Zu ladende Property
 * @param {string} boxName id der Checkbox
 */
function LoadCheckBox(property, boxName)
{

    $(boxName).bootstrapSwitch('setState', JSON.parse(property));

}

/**
 * Checkboxeinstellung speichern
 * 
 * @param {string} propertyName Zu speichernde Property
 * @param {string} newValue Wert
 */
function SaveCheckBox(propertyName, newValue)
{
    localStorage.setItem(propertyName, newValue);
}
