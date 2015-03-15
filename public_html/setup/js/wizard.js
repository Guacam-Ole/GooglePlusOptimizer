var gpoWizard = function () {
    this.AllSettings;
    this.CurrentStepId;
    this.WizardInitialized = false;
    this.CurrentLang;
};



gpoWizard.prototype = {
    constructor: gpoWizard,
    NewWizardOptionsExist:function(lastwizard) {
        try {

            lastwizard = lastwizard || "0";


            var manifest = chrome.runtime.getManifest();

            if (lastwizard === manifest.version) {
                return false;
            }
            var oldVersion = this.GetVersionLong(lastwizard);
            var newVersion = this.GetVersionLong(manifest.version);

            if (newVersion - oldVersion < 100) {
                // Nur bugfixes, keine Features
                return false;
            }

            return true;
        } catch (ex) {
            console.log(ex);
            return false;
        }
    },
    InitWizard:function(version) {
        var obj=this;
        try {
            if (obj.WizardInitialized === true) {
                return;
            }
            $('[data-iid="wizard"]').fadeOut(); // TODO: Schließen-Box anstatt automatischem Schließen
            obj.WizardInitialized = true;
            var manifest = chrome.runtime.getManifest();
            chrome.runtime.sendMessage(
                {
                    Action: "SaveWizardVersion",
                    ParameterValue: manifest.version
                }, function (response) {
                });
           // $('.make-switch').bootstrapSwitch();
            $('#nextSetting').click(function () {
                if (obj.CurrentStepId !== allPages[allPages.length - 1]) {
                    var pos = allPages.indexOf(obj.CurrentStepId);

                    $('#wr').find('.content').appendTo($('#' + currentStepId));
                    DisplayStep(allPages[pos + 1], pos + 1, allPages.length - 2);
                }
                return false;
            });
            $('#prevSetting').click(function () {
                if (obj.CurrentStepId !== allPages[0]) {
                    var pos = allPages.indexOf(obj.CurrentStepId);
                    $('#wr').find('.content').appendTo($('#' + obj.CurrentStepId));
                    DisplayStep(allPages[pos - 1], pos - 1, allPages.length - 2);
                }
                return false;
            });


            $('#reloadPage').click(function () {
                window.location.reload(true);
            });
            version = version || "0";

            //var version = window.location.search.substring(1) || "0";


            obj.CollectSteps(version);

            allPages = [];
            allPages.push('welcomeWizard');


            for (var i in allSettings) {
                allPages.push(allSettings[i]);
            }

            allPages.push('finishWizard');
            var divWidth = $('.container').width();
            var spamWidth = $('.spam').width();

            var screenWidth = $(window).width();

            $('.container').offset({left: ((screenWidth - divWidth) / 2)});
            $('.spam').offset({left: ((screenWidth - spamWidth) / 2)});
            obj.LoadWizardSettings();

          //  DisplayStep(allPages[0], 0, 0);
            $('#spam1').attr('src', chrome.extension.getURL("setup/images/alster.png"));
            $('.spam').fadeIn();


            $('#robbe').attr('src', chrome.extension.getURL("setup/images/progress.gif"));
            obj.WizSwitchEvents();
        } catch (ex) {
            console.log(ex);
        }
    },
    GetVersionLong:function(version) {

        var versionSplit = version.split('.');
        var versionLong = versionSplit[0] * 1000000;
        if (versionSplit.length > 1) {
            versionLong += versionSplit[1] * 10000;
        }
        if (versionSplit.length > 2) {
            versionLong += versionSplit[2] * 100;
        }
        if (versionSplit.length > 3) {
            versionLong += versionSplit[3] * 1;
        }
        return versionLong;
    },
    GetFeatureByShortname: function (haystack, needle) {
        return $.grep(haystack, function(e){ return e.Short == needle; })[0];
    },
    CollectSteps:function( version) {


        var obj=this;
        var minVersion = obj.GetVersionLong(version);
        obj.AllSettings=[];
        var complexFeatures=[];


        $.getJSON(Browser.GetExtensionFile("_locales/" + this.CurrentLang + "/features.json"), function (jsonFeatures) {
            // Wizard-Startkachel:
            obj.AllSettings.push(obj.GetFeatureByShortname(jsonFeatures,"welcomeWizard"));

            jsonFeatures.forEach(function (feature) {
                if (feature.Version!==undefined && obj.GetVersionLong(feature.Version) >= minVersion) {
                    if (feature.ShowInWizard===true) {
                        obj.AllSettings.push(feature);
                    } else if (feature.Type===undefined) {
                        complexFeatures.push(feature.Title);
                    }
                }
            });

            // Weitere-Optionen - Kachel:
            if (complexFeatures.length>0) {
                var complex=obj.GetFeatureByShortname(jsonFeatures,"moreOptions");
                complex.Description=complex.Description.replace('_EVENMORESTUFF_',complexFeatures.toString());
                obj.AllSettings.push(complex);
            }

            // Wizard-Ende-Kachel:
            obj.AllSettings.push(obj.GetFeatureByShortname(jsonFeatures,"finishWizard"));


            obj.PaintWizard();
        });
    },
    PaintWizard:function() {
        console.log("Horido!");
    },
    SwitchEvents:function() {
        $(".make-switch").on('switch-change', function (e, data) {
            var id = $(this).attr("id");


        });

    },
    DisplayStep:function(id, current, max) {
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
    },
    LoadCheckBox:function(property, boxName) {
        $(boxName).bootstrapSwitch('setState', JSON.parse(property));
    },
    SaveCheckBox:function(propertyName, newValue) {
        localStorage.setItem(propertyName, newValue);
    }
}
