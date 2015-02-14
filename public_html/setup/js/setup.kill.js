$(document).ready(function () {
    try {
        $(function () {
            $("#accordion").accordion();
        });
        $(function () {
            $("#accordion2").accordion();
        });
        FillSportData();
        FillWeatherData();
        ShowTicks();


        $('#clockPos').change(function () {
            localStorage.setItem("StoppWatch", $("#clockPos").val());
        });
        $('#addQuickShare').click(function () {
            AddQuickShareRow();
        });
        if (document.location.href.indexOf("additions") > 0) {
            InitQSEvents();
            GetQuickShareInfo();
            LoadAllQuickShares();
        }

    } catch (ex) {
        console.log(ex);
    }
});
$(function () {
    $(".dial").knob();
});


function ShowTicks() {
    try {
        var displayTicks = [];
        var displayTicksStart = [];

        if (window.location.href.indexOf('measure.html') > 0) {
            chrome.runtime.sendMessage({
                Action: "LoadTicks"
            }, function (response) {
                ticks = response.Ticks;
                if (ticks !== null) {
                    ticks = JSON.parse(ticks);

                    $.each(ticks, function (i, val) {

                        if (val.Type === "START") {
                            if (val.IsInit) {
                                displayTicksStart.push({
                                    Name: val.Name,
                                    Start: val.Time,
                                    IsInit: val.IsInit,
                                    Stopp: null,
                                    Diff: null
                                });
                            } else {
                                displayTicks.push({
                                    Name: val.Name,
                                    Start: val.Time,
                                    IsInit: val.IsInit,
                                    Stopp: null,
                                    Diff: null
                                });
                            }
                        } else if (val.Type === "STOPP") {
                            if (val.IsInit) {
                                var oldEntry = $.grep(displayTicksStart, function (e) {
                                    return e.Name === val.Name && e.Stopp === null;
                                });
                            } else {
                                var oldEntry = $.grep(displayTicks, function (e) {
                                    return e.Name === val.Name && e.Stopp === null;
                                });
                            }
                            if (oldEntry !== undefined && oldEntry.length > 0) {
                                oldEntry[0].Stopp = val.Time;
                                oldEntry[0].Diff = (oldEntry[0].Stopp - oldEntry[0].Start) / 1000;
                            }
                        }
                    });
                }
                var displayStart = "<pre>";
                $.each(displayTicksStart, function (i, val) {
                    displayStart += val.Name + ":" + val.Diff + "s\n";
                });
                displayStart += "</pre>";

                var displayDyn = "<pre>";
                $.each(displayTicks, function (i, val) {
                    displayDyn += val.Name + ":" + val.Diff + "s \n";
                });
                displayDyn += "</pre>";
                $('#messStart')[0].innerHTML = displayStart;
                $('#messDyn')[0].innerHTML = displayDyn;
            });
        }
    } catch (e) {
        console.log(e);
    }
}
/**
 * Wetterdaten
 */
function FillWeatherData() {
    $('.searchWeather').click(function () {
        try {
            var weather = $(this);
            var weatherCombo = weather.closest('.tableWeather').find('select.weatherType');
            var weatherInput = weather.closest('.tableWeather').find('input');
            weatherCombo.children().remove();
            var query = "select woeid, country,name, postal from geo.places where text=\"" + weatherInput.val() + "\"";
            var api = 'https://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent(query) + '&format=json';
            console.log("API:" + api);
            $.getJSON(api, function (data) {
                for (var i in data.query.results.place) {
                    var place = data.query.results.place[i];
                    var plz = place.postal;
                    if (plz === null || plz === undefined) {
                        plz = "";
                    } else {
                        plz = plz.content;
                        if (plz === null || plz === undefined) {
                            plz = "";
                        }
                    }
                    var entry = plz + " " + place.name + ", " + place.country.content;
                    var id = place.woeid;
                    weatherCombo.append("<option value='" + id + "'>" + entry + "</option>");
                }
            });
            return false;
        } catch (ex) {
            console.log(ex);
        }
    });
}

/**
 * Sportdaten
 */
function FillSportData() {

    //GetAllSports
    $completeUrl = "http://www.nocarrier.de/opendb.php?command=GetAllSports";
    $.getJSON($completeUrl, function (data) {
        try {
            $('select.sportType').children().remove();
            $('select.sportType').append("<option value='null'>(bitte wählen)</option>");
            for (var i in data.Sport) {
                var id = data.Sport[i].sportsID;
                var name = data.Sport[i].sportsName;
                $('select.sportType').append("<option value='" + id + "'>" + name + "</option>");
            }
        } catch (ex) {
            console.log(ex);
        }
    });
    $('select.sportType').change(function () {
        var sport = $(this);
        var leagueCombo = sport.closest('.tableSport').find('select.sportLeague');
        $completeUrl = "http://www.nocarrier.de/opendb.php?command=GetLeagues&sport=" + $(this).val();
        $.getJSON($completeUrl, function (data) {
            try {
                leagueCombo.children().remove();
                var dictLeagues = {};
                var leagueNames = new Array();
                now = new Date();
                for (var i in data.League) {
                    var id = data.League[i].leagueShortcut;
                    var name = data.League[i].leagueName;
                    var league = JSON.parse(data.League[i].leagueSaison);
                    var savedYear = dictLeagues[id];
                    if (league === now.getFullYear() || league === now.getFullYear() - 1) {
                        if (savedYear === null || savedYear === undefined || savedYear < league) {
                            dictLeagues[id] = league;
                            leagueNames[id] = name;
                        }
                    }
                }
                for (var id in dictLeagues) {
                    leagueCombo.append("<option value='" + id + "|" + dictLeagues[id] + "'>" + leagueNames[id] + "</option>");
                }
            } catch (ex) {
                console.log(ex);
            }
        });
        leagueCombo.attr('disabled', false);
    });
    return false;
}

/**
 * Clickbilder-Events erzeugen
 */
function CreateImageEvents() {
    $("#filterPlus").click(function () {
        SaveSwitch("plus1", "#filterPlus", "plus1");
    });
    $("#filterYt").click(function () {
        SaveSwitch("yt", "#filterYt", "yt");
    });
    $("#filterWham").click(function () {
        SaveSwitch("wham", "#filterWham", "wham");
    });
    $("#filterHashtag").click(function () {
        SaveSwitch("hashtag", "#filterHashtag", "hashtag");
    });
    $("#filterCustom").click(function () {
        SaveSwitch("custom", "#filterCustom", "custom");
    });
    $("#filterCommunity").click(function () {
        SaveSwitch("community", "#filterCommunity", "community");
    });
    $("#filterBirthday").click(function () {
        SaveSwitch("birthday", "#filterBirthday", "kuchen");
    });
    $("#filterKnown").click(function () {
        SaveSwitch("known", "#filterKnown", "hug");
    });
    $("#filterImages").click(function () {
        SaveSwitch("filterImages", "#filterImages", "filterimage");
    });
    $("#filterVideos").click(function () {
        SaveSwitch("filterVideo", "#filterVideos", "filtervideo");
    });
    $("#filterLinks").click(function () {
        SaveSwitch("filterLinks", "#filterLinks", "filterurl");
    });
    $("#filterSharedCircles").click(function () {
        SaveSwitch("filterSharedCircles", "#filterSharedCircles", "circles");
    });
}


/**
 * Tags-Eingaben
 */
function handleTagsInput() {
    if (!jQuery().tagsInput) {
        return;
    }


    $('#fulltext').tagsInput(
        {
            width: 'auto',
            'onAddTag': function () {
                // alert('SAY MY NAME!');
                SaveString("fulltext", $('#fulltext').val());
            },
            'onRemoveTag': function () {
                // alert('YOUR DAMN RIGHT!');
                SaveString("fulltext", $('#fulltext').val());
            }
        });
    $('#hashtags').tagsInput(
        {
            width: 'auto',
            'onAddTag': function () {
                try {
                    var hashTags = $('#hashtags').val();
                    $('#hashtags').val("");
                    // Prüfen, ob alle Einträge eine Raute besitzen:
                    var hashTagArray = hashTags.split(',');
                    $.each(hashTagArray, function (i, hashTag) {
                        var tmp;
                        if ($('#hashtags').val() !== '') {
                            tmp = $('#hashtags').val() + ",";
                            $('#hashtags').val(tmp);
                        }
                        hashTag = "#" + hashTag.trim().replace("#", "");
                        tmp = $('#hashtags').val() + hashTag;
                        $('#hashtags').val(tmp);
                    });
                    // Speichern der geänderten Werte
                    SaveString("hashTags", $('#hashtags').val());
                } catch (ex) {
                    console.log(ex);
                }
            },
            'onRemoveTag': function () {
                SaveString("hashTags", $('#hashtags').val());
            }
        });
}


/**
 * Checkboxeinstellung laden
 * @param {string} propertyName Zu ladende Property
 * @param {string} boxName id der Checkbox
 * @param {string} defaultValue description
 */
function LoadCheckBox(propertyName, boxName, defaultValue) {
    try {
        if (defaultValue === undefined) {
            defaultValue = "false";
        }
        var oldValue = localStorage.getItem(propertyName);
        if (oldValue === null || oldValue === "undefined") {
            oldValue = defaultValue;
        }

        boxName.bootstrapSwitch('setState', JSON.parse(oldValue));
    } catch (ex) {
        console.log(ex);
    }
}

/**
 * Checkboxeinstellung speichern
 *
 * @param {string} propertyName Zu speichernde Property
 * @param {string} newValue Wert
 */
function SaveCheckBox(propertyName, newValue) {
    localStorage.setItem(propertyName, newValue);
}
/**
 * Switch-Einstellung (Bild) laden
 * @param {string} propertyName Zu speichernde Property
 * @param {string} imageId Id des Bildes
 * @par@param {string} imageSrc Dateiname des Bildes
 */

function LoadSwitch(propertyName, imageId, imageSrc) {
    try {
        var oldValue = JSON.parse(localStorage.getItem(propertyName));
    }
    catch (ex) {
        oldValue = false;
    }
    if (oldValue === null || oldValue === "undefined") {
        oldValue = false;
    }
    EnDisImage(imageId, imageSrc, oldValue);
}

/**
 * Beliebigen Text speichern
 *
 * @param {string} propertyName Zu speichernde Property
 * @param {string} newValue Wert
 *
 */
function SaveString(propertyName, newValue) {
    localStorage.setItem(propertyName, newValue);
}

/**
 *  Schalter (Bild) speichern
 *
 * @param {string} propertyName Zu speichernde Property
 * @param {string} imageId Id des Bildes
 * @par@param {string} imageSrc Dateiname des Bildes
 */
function SaveSwitch(propertyName, imageId, imageSrc) {

    try {
        var oldValue = JSON.parse(localStorage.getItem(propertyName));
        if (oldValue === null || oldValue === "undefined") {
            oldValue = false;
        }

        var newValue = !oldValue;
        localStorage.setItem(propertyName, newValue);
        EnDisImage(imageId, imageSrc, newValue);
    } catch (ex) {
        localStorage.setItem(propertyName, false);
    }
}

/**
 * Erweiterte Einstellungen laden
 */
function LoadExtended() {
    try {
        if (window.location.href.indexOf('help.html') > 0) {
            $('.dropdown-toggle').dropdown();
            var wizardMode = localStorage.getItem("WizardMode") || 1;
            if (wizardMode === null) {
                wizardMode = 1;
            } else {
                wizardMode = JSON.parse(wizardMode);
            }

            switch (wizardMode) {
                case 1:
                    $('#butWizDisplay').text($('#butWizDefault').text());
                    break;
                case -1:
                    $('#butWizDisplay').text($('#butWizDisable').text());
                    break;
                case 0:
                    $('#butWizDisplay').text($('#butWizReset').text());
                    break;
            }
        }

        $('#hashtags').val(localStorage.getItem("hashTags"));
        $('#fulltext').val(localStorage.getItem("fulltext"));
        $("#clockPos").val(localStorage.getItem("StoppWatch"));
        var columns = localStorage.getItem("columns");
        if (columns === null || columns === undefined) {
            columns = 3;
        } else {
            columns = JSON.parse(columns);
        }

        if ($('.sportPosition').length > 0) {
            $('.sportPosition').empty();
            $('.weatherPosition').empty();
            $('.clockPos').empty();
            $("<option/>").val(-1).text(chrome.i18n.getMessage("WidgetHide")).appendTo('.sportPosition');
            $("<option/>").val(-1).text(chrome.i18n.getMessage("WidgetHide")).appendTo('.weatherPosition');
            $("<option/>").val(-1).text(chrome.i18n.getMessage("WidgetHide")).appendTo('.clockPos');
            if (columns === 1) {
                $("<option/>").val(0).text(chrome.i18n.getMessage("WidgetShow")).appendTo('.sportPosition');
                $("<option/>").val(0).text(chrome.i18n.getMessage("WidgetShow")).appendTo('.weatherPosition');
                $("<option/>").val(0).text(chrome.i18n.getMessage("WidgetShow")).appendTo('.clockPos');
            }
            else if (columns === 2) {
                $("<option/>").val(0).text(chrome.i18n.getMessage("WidgetLeft")).appendTo('.sportPosition');
                $("<option/>").val(0).text(chrome.i18n.getMessage("WidgetLeft")).appendTo('.weatherPosition');
                $("<option/>").val(0).text(chrome.i18n.getMessage("WidgetLeft")).appendTo('.clockPos');
                $("<option/>").val(1).text(chrome.i18n.getMessage("WidgetRight")).appendTo('.sportPosition');
                $("<option/>").val(1).text(chrome.i18n.getMessage("WidgetRight")).appendTo('.weatherPosition');
                $("<option/>").val(1).text(chrome.i18n.getMessage("WidgetRight")).appendTo('.clockPos');

            } else {
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
    } catch (ex) {
        console.log(ex);
    }
}

/**
 * Setup-Einstellungne, sobald DOM bereit
 */
function LoadSetup() {
    try {
        console.log('G+Filter: Einstellungsseite');
        var manifest = chrome.runtime.getManifest();
        $('#version').html("Version " + manifest.version);
        $('#title').html(manifest.name);
        document.title = manifest.name + " Setup";
        // Allgemeine Einstellungen
        LoadSwitch("plus1", "#filterPlus", "plus1");
        LoadSwitch("yt", "#filterYt", "yt");
        LoadSwitch("wham", "#filterWham", "wham");
        LoadSwitch("hashtag", "#filterHashtag", "hashtag");
        LoadSwitch("custom", "#filterCustom", "custom");
        LoadSwitch("community", "#filterCommunity", "community");
        LoadSwitch("birthday", "#filterBirthday", "kuchen");
        LoadSwitch("known", "#filterKnown", "hug");
        LoadSwitch("filterImages", "#filterImages", "filterimage");
        LoadSwitch("filterVideo", "#filterVideos", "filtervideo");
        LoadSwitch("filterLinks", "#filterLinks", "filterurl");
        LoadSwitch("filterSharedCircles", "#filterSharedCircles", "circles");

        // Erweiterte Einstellungen:		
        LoadCheckBox("WHAMWhamText", $("#chkWhamText"));
        LoadCheckBox("WHAMWhamUrl", $("#chkWhamUrl"));
        LoadCheckBox("WHAMChristmasText", $("#chkChristmasText"));
        LoadCheckBox("WHAMChristmasUrl", $("#chkChristmasUrl"));
        LoadCheckBox("colorUsers", $("#chkDisplayColors"));
        LoadCheckBox("displayTrophy", $("#chkTrophies"));
        LoadCheckBox("filterGifOnly", $("#chkFilterGif"));
        LoadCheckBox("filterMp4Only", $("#chkFilterMp4"));
        LoadCheckBox("showEmoticons", $('#chkShowEmoticons'));
        LoadCheckBox("useAutoSave", $('#chkAutoSave'));
        LoadCheckBox("useBookmarks", $('#chkBookmarks'));
        LoadCheckBox("markLSRPosts", $('#chkLSRMarker'));
        LoadCheckBox("CollectTicks", $('#chkMeasure'));
        LoadCheckBox("displayQuickHashes", $('#chkQuickHashes'));
        LoadCheckBox("displayLang", $('#chkLang'));


        //LoadCheckBox("StoppWatch", $("#chkStopWatch"));
        LoadExtended();
        LoadWeather();


        var interval = JSON.parse(localStorage.getItem("interval"));
        if (interval === null || interval < 10) {
            interval = 500;
        }
        $("#dialDelay").val(interval);
        // Bild-Wechsel bei Click
        $(".trigger").click(function () {
            $(".panel").toggle("fast");
            $(this).toggleClass("active");
            return false;
        });
        // Tooltip anzeigeb
        $('.tooltip_button').tooltip(
            {
                effect: 'fade',
                predelay: 400,
                position: 'top center',
                offset: [-30, 94]
            });
        handleTagsInput();
        // Events erzeugen
        CreateImageEvents();
        CreateCheckboxEvents();
        CreateTextboxEvents();
        GetSportTypes();
        SaveWeatherSettings();


        $('#butWizReset').click(function () {
            localStorage.setItem("lastWizard", "0");
            localStorage.setItem("WizardMode", "0");
            $('#butWizDisplay').text($(this).text());
        });
        $('#butWizDisable').click(function () {
            localStorage.setItem("WizardMode", "-1");
            $('#butWizDisplay').text($(this).text());
        });
        $('#butWizDefault').click(function () {
            localStorage.setItem("WizardMode", "1");
            $('#butWizDisplay').text($(this).text());
        });

        $('#butCreateContext').click(function () {
            CreateContextMenu();
        });
    } catch (ex) {
        console.log(ex);
    }
}

/**
 * Bild austauschen
 * @param {string} id       Id des Bildes
 * @param {string} image    Dateiname
 * @param {bool} enable     Aktivieren?
 */
function EnDisImage(id, image, enable) {
    var filePath = "../images/icons/";
    if (enable) {
        filePath += "active";
    } else {
        filePath += "inactive";
    }
    filePath += "/" + image + ".jpg";
    $(id).attr("src", filePath);
}


/**
 * Sport-Speichern
 */
function GetSportTypes() {
    $('#saveSport').click(function () {
        try {
            var sport1League = $('#cmbLeague1').val();
            var sport2League = $('#cmbLeague2').val();
            var sport3League = $('#cmbLeague3').val();
            var sport1Sport = $('#sport1Sport').val();
            var sport2Sport = $('#sport2Sport').val();
            var sport3Sport = $('#sport3Sport').val();
            var sport1Pos = $('#sport1Pos').val();
            var sport2Pos = $('#sport2Pos').val();
            var sport3Pos = $('#sport3Pos').val();
            if (sport1League === "null" || sport1League === undefined || sport1League === "") {
                sport1League = "|";
            }
            if (sport2League === "null" || sport2League === undefined || sport2League === "") {
                sport2League = "|";
                ;
            }
            if (sport3League === "null" || sport3League === undefined || sport3League === "") {
                sport3League = "|";
                ;
            }

            var sport1Season = sport1League.split("|")[1];
            var sport2Season = sport2League.split("|")[1];
            var sport3Season = sport3League.split("|")[1];
            var sport1League = sport1League.split("|")[0];
            var sport2League = sport2League.split("|")[0];
            var sport3League = sport3League.split("|")[0];
            var sport1LeagueName = $('#cmbLeague1 option:selected').text();
            var sport2LeagueName = $('#cmbLeague2 option:selected').text();
            var sport3LeagueName = $('#cmbLeague3 option:selected').text();
            var sport1SportName = $('#sport1Sport option:selected').text();
            var sport2SportName = $('#sport1Sport option:selected').text();
            var sport3SportName = $('#sport1Sport option:selected').text();
            var sport1 = {
                Position: sport1Pos,
                SportName: sport1SportName,
                Sport: sport1Sport,
                League: sport1League,
                Season: sport1Season,
                LeagueName: sport1LeagueName
            };
            var sport2 = {
                Position: sport2Pos,
                SportName: sport2SportName,
                Sport: sport2Sport,
                League: sport2League,
                Season: sport2Season,
                LeagueName: sport2LeagueName
            };
            var sport3 = {
                Position: sport3Pos,
                SportName: sport3SportName,
                Sport: sport3Sport,
                League: sport3League,
                Season: sport3Season,
                LeagueName: sport3LeagueName
            };
            var sportSetting = new Array();
            sportSetting.push(sport1);
            sportSetting.push(sport2);
            sportSetting.push(sport3);
            localStorage.setItem("Sport", JSON.stringify(sportSetting));
            return false;
        } catch (ex) {
            console.log(ex);
        }
    });
    LoadSport();
}

/**
 * Wetter klick
 */
function SaveWeatherSettings() {
    $('#saveWeather').click(function () {
        try {
            var weather1Id = $('#weather1Ort').val();
            var weather2Id = $('#weather2Ort').val();
            var weather3Id = $('#weather3Ort').val();
            var weather1Name = $('#weather1Ort option:selected').text();
            var weather2Name = $('#weather2Ort option:selected').text();
            var weather3Name = $('#weather3Ort option:selected').text();
            var weather1Pos = $('#weather1Pos').val();
            var weather2Pos = $('#weather2Pos').val();
            var weather3Pos = $('#weather3Pos').val();
            var weather1 = {Position: weather1Pos, Id: weather1Id, Text: weather1Name};
            var weather2 = {Position: weather2Pos, Id: weather2Id, Text: weather2Name};
            var weather3 = {Position: weather3Pos, Id: weather3Id, Text: weather3Name};
            var weatherSetting = new Array();
            weatherSetting.push(weather1);
            weatherSetting.push(weather2);
            weatherSetting.push(weather3);
            localStorage.setItem("Weather", JSON.stringify(weatherSetting));
            return false;
        } catch (ex) {
            console.log(ex);
        }
    });
}

/**
 * Wetter laden
 */
function LoadWeather() {
    var weatherSetting = JSON.parse(localStorage.getItem("Weather"));
    for (var i in weatherSetting) {
        var u = parseInt(i) + 1;
        var setting = weatherSetting[i];
        var wPos = '#weather' + u + 'Pos';
        var wOrt = '#weather' + u + 'Ort';
        $(wPos).val(setting.Position);
        $(wOrt).children().remove();
        $(wOrt).append("<option value='" + setting.Id + "'>" + setting.Text + "</option>");
        $(wOrt).val(setting.Id);
    }
}

/**
 * Sport laden
 */
function LoadSport() {
    var sportSetting = JSON.parse(localStorage.getItem("Sport"));
    for (var i in sportSetting) {
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
}

/**
 * Delay-Knob
 */
function CreateTextboxEvents() {
    $("#dialDelay").knob(
        {
            'change': function (v) {
                var interval = $("#dialDelay").val();
                if ($.isNumeric(interval)) {
                    var intervalNr = parseInt(interval);
                    if (intervalNr >= 10) {
                        localStorage.setItem("interval", intervalNr);
                    }
                }
            }
        });
}

/**
 * Checkbox-Events
 */
function CreateCheckboxEvents() {
    // Filter:
    $("#chkWhamText").on('switch-change', function (e, data) {
        SaveCheckBox("WHAMWhamText", data.value);
    });
    $("#chkWhamUrl").on('switch-change', function (e, data) {
        SaveCheckBox("WHAMWhamUrl", data.value);
    });
    $("#chkChristmasText").on('switch-change', function (e, data) {
        SaveCheckBox("WHAMChristmasText", data.value);
    });
    $("#chkChristmasUrl").on('switch-change', function (e, data) {
        SaveCheckBox("WHAMChristmasUrl", data.value);
    });
    $("#chkFilterGif").on('switch-change', function (e, data) {
        SaveCheckBox("filterGifOnly", data.value);
    });
    $("#chkFilterMp4").on('switch-change', function (e, data) {
        SaveCheckBox("filterMp4Only", data.value);
    });

    // Erweiterungen:
    $("#chkDisplayColors").on('switch-change', function (e, data) {
        SaveCheckBox("colorUsers", data.value);
    });
    $("#chkTrophies").on('switch-change', function (e, data) {
        SaveCheckBox("displayTrophy", data.value);
    });
    $("#chkShowEmoticons").on('switch-change', function (e, data) {
        SaveCheckBox("showEmoticons", data.value);
    });
    $("#chkAutoSave").on('switch-change', function (e, data) {
        SaveCheckBox("useAutoSave", data.value);
    });
    $("#chkBookmarks").on('switch-change', function (e, data) {
        SaveCheckBox("useBookmarks", data.value);
    });
    $("#chkLang").on('switch-change', function (e, data) {
        SaveCheckBox("displayLang", data.value);
    });

    $("#chkLSRMarker").on('switch-change', function (e, data) {
        SaveCheckBox("markLSRPosts", data.value);
    });

    // Filter:
    $("#chkMeasure").on('switch-change', function (e, data) {
        SaveCheckBox("CollectTicks", data.value);
    });
    $("#chkQuickHashes").on('switch-change', function (e, data) {
        SaveCheckBox("displayQuickHashes", data.value);
    });


}

function CreateContextMenu() {
    chrome.runtime.sendMessage(
        {
            Action: "CreateContextMenu"
        });
}

