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
    SaveVersion:function () {
        var manifest = chrome.runtime.getManifest();
        chrome.runtime.sendMessage(
        {
            Action: "SaveWizardVersion",
            ParameterValue: manifest.version
        }, function (response) {});
    },
    InitWizard:function(version) { },
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
    }
}
