var gpoWizard = function () {
    this.AllSettings;
    this.CurrentStepId;
    this.WizardInitialized = false;
    this.CurrentLang;
    this.ImgPrefix;
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

            $('#nextSetting').click(function () {
                obj.CurrentStepId++;
                obj.DisplayFeature(obj.CurrentStepId);
                return false;
            });
            $('#prevSetting').click(function () {
                obj.CurrentStepId--;
                obj.DisplayFeature(obj.CurrentStepId);
                return false;
            });

            this.ImgPrefix=imageHost +"wizard/"+ obj.CurrentLang + "/";


                $('#reloadPage').click(function () {
                window.location.reload(true);
            });
            version = version || "0";

            //var version = window.location.search.substring(1) || "0";


            obj.CollectSteps(version);

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
        this.CurrentStepId=0;
        this.SwitchEvents();
        $( document ).ready(function() {

            //$('.make-switch').bootstrapSwitch();
        });
        this.DisplayFeature();
    },
    SwitchEvents:function() {
        var obj=this;
        $.getScript(Browser.GetExtensionFile("/setup/js/lib/jquery-1.10.2.min.js"), function() {
            $.getScript(Browser.GetExtensionFile("/setup/js/lib/jquery-ui.min.js"), function () {
                $('.wizSwitch').switchButton();
            });
        });

        $('#wizSlide').on('click', function (e, data) {
            var short = $(this).data("short");
            obj.SaveSetting(short,$(this).prop("checked"));
        });
    },
    DisplayFeature: function () {
        if (this.CurrentStepId<0) {
            this.CurrentStepId++;
        }
        if (this.CurrentStepId>(this.AllSettings.length-1)) {
            this.CurrentStepId--;
        }
        var mode=null;
        var feature=this.AllSettings[this.CurrentStepId];

        $('#prevSetting').removeClass('wizInactive');
        $('#nextSetting').removeClass('wizInactive');
        $('#nextSetting').addClass("wizActive");
        $('#prevSetting').addClass("wizActive");
        if (this.CurrentStepId==0) {
            // erste Seite
            $('#prevSetting').removeClass('wizActive');
            $('#prevSetting').addClass("wizInactive");;
        }
        if (this.CurrentStepId==this.AllSettings.length-1) {
            // letzte Seite:
            $('#nextSetting').removeClass('wizActive');
            $('#nextSetting').addClass("wizInactive");
            // TODO: SAVE!
        }

        $('.wizardImage img').attr('src', this.ImgPrefix + feature.Image);
        $('.wizardRight h3').text(feature.Title);
        $('#wr').empty();
        $('#wr').append(feature.Description);
        $('#wizardSubtitle').text("("+(this.CurrentStepId+1)+"/" + (this.AllSettings.length-1) + ")");
        if (feature.ShowInWizard) {
            $('.switch-wrapper').show();
            chrome.runtime.sendMessage({
                Action: "GetSetting",
                Name: feature.Short
            }, function (response) {
                var value = response.Result;
                $('#wizSlide').data("short",feature.Short);
                $('#wizSlide').prop('checked',value=="true");
            });
        } else {
            $('.switch-wrapper').hide();
        }
    },
    SaveSetting:function(key, value) {
        chrome.runtime.sendMessage({
            Action: "SetSetting",
            Name: key,
            Value: value
        }, function (response) {});
    }

}
