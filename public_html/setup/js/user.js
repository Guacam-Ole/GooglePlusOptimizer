
var userColorTimeout;
var allCssColors;
var allUserSettingsFromBackground;

function OptStartColors() {
    allCssColors = GetCssColors();
    GetAllUserSettings();
    console.log("Color loaded.");
}
/**
 * Farbigen Block und Texteingabe zeichnen
 * @returns {undefined}
 */
function PaintColorBlock()
{
    if (document.URL.indexOf("about") === -1 && document.URL.indexOf("posts") === -1)
    {
        return;
    }
    try {
        if ($(".colorUsers").length > 0 || $('[ guidedhelpid="profile_name"]').length === 0)
        {
            return;
        }
        $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("./setup/css/user.css") + "' type='text/css' media='screen' />"));
        var userName = GetUserName();
        //   GetAllUserSettings();

        var colorBlock = "<br><table class=\"colorUsers\"><tbody><tr><td class=\"usrWhite colClick\">✓</td><td class=\"usrBlue colClick\">&nbsp;</td><td class=\"usrYellow colClick\">&nbsp;</td><td class=\"usrRed colClick\">&nbsp;</td><td class=\"usrCyan colClick\">&nbsp;</td><td class=\"usrGreen colClick\">&nbsp;</td><td class=\"usrMagenta colClick\">&nbsp;</td></tr></tbody></table>";
        var userInfo = "<input type=\"text\" class=\"userRemark\" placeholder=\"" + chrome.i18n.getMessage("RemarkPlaceholder") + "\" />";
        //keine Anmerkung für " + userName + " vorhanden\" />";
        $('[ guidedhelpid="profile_name"]').append(colorBlock + userInfo.replace('__USER__', userName));
        $('.colClick').click(function() {
            RemoveSelection();
            $(this).append("✓");
            UpdateUserData();
        });
        $('.userRemark').change(function() {
            UpdateUserData();
        });

        userColorTimeout = setTimeout(PaintCurrentUserSettings, 1000); // Ajax request (Scrollen: Alle halbe Sekunde checken)
    } catch (ex) {
        console.log(ex);
    }
}

/**
 * User farbig hervorheben
 */
function PaintForUser()
{
    //  return;
    if (allUserSettingsFromBackground === null || allUserSettingsFromBackground === undefined)
    {
        return;
    }

    for (var i in allUserSettingsFromBackground)
    {
        try {
            if (allUserSettingsFromBackground[i].Color !== "rgb(0, 0, 0)" && allUserSettingsFromBackground[i].Color !== "rgba(0, 0, 0, 0)")
            {
                // Einfärben
                for (var u in allCssColors)
                {
                    if (allCssColors[u].Color === allUserSettingsFromBackground[i].Color)
                    {
                        $('h3 [oid="' + allUserSettingsFromBackground[i].UserId + '"]').closest('[role="article"]').addClass("vna");
                        $('h3 [oid="' + allUserSettingsFromBackground[i].UserId + '"]').closest('[role="article"]').addClass(allCssColors[u].CssClass);
                    }
                }
            }
            if (allUserSettingsFromBackground[i].Text !== null && allUserSettingsFromBackground[i].Text !== undefined && allUserSettingsFromBackground[i].Text !== "")
            {
                if ($('h3 [oid="' + allUserSettingsFromBackground[i].UserId + '"]').closest('.lea').length > 0)
                {
                    $('h3 [oid="' + allUserSettingsFromBackground[i].UserId + '"]').closest('.lea').each(function() {
                        if ($(this).html().indexOf('infoImg') === -1)
                        {
                            $(this).prepend("<img class=\"infoImg\" title=\"" + allUserSettingsFromBackground[i].Text + "\" src=\"" + chrome.extension.getURL('setup/images/info.png') + "\" />");
                        }
                    });
                }
            }
        } catch (ex) {
            console.log(ex);
        }
    }
}

/**
 * Benutzernamen auslesen
 * @returns {string} Username
 */
function GetUserName()
{
    return $('[guidedhelpid="profile_name"]').html();
}

/**
 * Einstellungen des aktuellen Users auslesen und darstellen
 */
function PaintCurrentUserSettings()
{
    try {
        clearTimeout(userColorTimeout);
        var currentUserSettings = GetCurrentUserSettings() || null;
        if (currentUserSettings === null)
        {
            return; // Noch keine Einstellungen
        }

        var usrText = currentUserSettings.Text;
        $('.userRemark').val(usrText);
        var usrColor = currentUserSettings.Color;

        $('.colorUsers td').each(function()
        {
            var color = $(this).css("background-color");
            if (color === usrColor) {
                RemoveSelection();
                $(this).append("✓");
            }
        }
        );
    } catch (ex) {
        console.log(ex);
    }
}

/**
 * Aktuellen Benutzer bestimmen
 * @returns {userId}
 */
function GetCurrentUserId()
{
    var dirtyId = $('[role=tablist]').attr("id");
    return dirtyId.split('-')[0];
}

/**
 * Alle Haken in den farbigen Boxen entfernen
 */
function RemoveSelection()
{
    $('.colorUsers td').each(function()
    {
        $(this).html("");
    }
    );
}

/**
 * Einstellungen des aktuellen Users auslesen
 * @returns {GetCurrentUserSettings.userSettings|Array|Object}
 */
function GetCurrentUserSettings()
{
    try {
        var currentUserId = GetCurrentUserId();
        var allUserSettings = allUserSettingsFromBackground;
        if (allUserSettings === null || allUserSettings === undefined)
        {
            return null;
        }
        var userSettings = allUserSettings;
        for (var i in userSettings)
        {
            if (userSettings[i].UserId === currentUserId)
            {
                userSettings[i].I = i; // Dummy value für index
                return userSettings[i];
            }
        }
    } catch (ex) {
        console.log(ex);
    }
}

/**
 * Benutzereinstellungen an Background-Script senden
 * @param {objekt} allUserSettings Benutzereinstellungen
 */
function SaveAllUserSettings(allUserSettings)
{
    chrome.runtime.sendMessage(
            {
                Action: "SaveUsers", ParameterValue: JSON.stringify(allUserSettings)
            }, function(response)
    {
    }
    );
}
/**
 * Parameter in Objekt verwandeln
 * @param {int} i Index
 * @param {string} remark Bemerkung
 * @param {string} color Farbe
 * @returns {GetSettingsObject.currentSettingObject|Object} Userobjekt
 */
function GetSettingsObject(i, remark, color)
{
    var currentSettingObject = new Object();
    currentSettingObject.I = i;
    currentSettingObject.Text = remark;
    currentSettingObject.Color = color;
    currentSettingObject.UserId = GetCurrentUserId();
    return currentSettingObject;
}

/**
 * Benutzereinstellungen speichern
 * @param {string} remark Bemerkung
 * @param {string} color Farbe
 */
function AddUserSettings(remark, color)
{
    var allUserSettings = allUserSettingsFromBackground;
    if (allUserSettings === null || allUserSettings === undefined)
    {
        allUserSettings = [];
    }
    var currentSettingsObject = GetSettingsObject(-1, remark, color);
    allUserSettings.push(currentSettingsObject);
    SaveAllUserSettings(allUserSettings);
}

/**
 * Benutzereinstellungen entfernen
 * @param {int} i Index
 */
function RemoveUserSettigns(i)
{
    var allUserSettings = allUserSettingsFromBackground;
    allUserSettings.splice(i, 1);
    SaveAllUserSettings(allUserSettings);
}

/**
 * Benutzereinstellungen aktualisieren
 * @param {int} i Index
 * @param {string} remark Bemerkung
 * @param {string} color Farbe
 */
function UpdateUserSettings(i, remark, color)
{
    var allUserSettings = allUserSettingsFromBackground;
    var currentSettingsObject = GetSettingsObject(i, remark, color);
    allUserSettings[i] = currentSettingsObject;
    SaveAllUserSettings(allUserSettings);
}

/**
 * Benutzerdaten speichern
 * @returns {undefined}
 */
function UpdateUserData()
{
    try {
        var userRemark = $('.userRemark').val();
        var selectedColor;
        var removeData = (($('.usrWhite').val() === '✓') && userRemark.trim() === "");

        $('.colorUsers td').each(function()
        {
            if ($(this).html() === "✓")
            {
                selectedColor = $(this).css("background-color");
            }
        }
        );
        // Alte Daten laden:
        var currentUserSettings = GetCurrentUserSettings();
        if (currentUserSettings === null || currentUserSettings === undefined)
        {
            if (removeData)
            {
                return; // Nichts zu tun
            }
            AddUserSettings(userRemark, selectedColor);  // Einstellung hinzufügen
        } else {
            if (removeData)
            {
                RemoveUserSettings(currentUserSettings.I);
            } else {
                UpdateUserSettings(currentUserSettings.I, userRemark, selectedColor)
            }
        }
    } catch (ex) {
        console.log(ex);
    }
}



/**
 * Sämtliche Usereinstellungen auslesen
 * @returns {userEinstellungen}
 */
function GetAllUserSettings()
{
    chrome.runtime.sendMessage(
            {
                Action: "LoadUsers"
            }, function(response)
    {
        allUserSettingsFromBackground = JSON.parse(response.AllUserSettings);
    }
    );
}


function hexToR(h) {
    return parseInt((cutHex(h)).substring(0, 2), 16);
}
function hexToG(h) {
    return parseInt((cutHex(h)).substring(2, 4), 16);
}
function hexToB(h) {
    return parseInt((cutHex(h)).substring(4, 6), 16);
}
function cutHex(h) {
    return (h.charAt(0) === "#") ? h.substring(1, 7) : h;
}

function hexToRGB(hex)
{
    var r = hexToR(hex);
    var g = hexToG(hex);
    var b = hexToB(hex);
    return [r, g, b];
}

function GetCssColors()
{
    var colors = [];
    colors.push(AddToCssColor("76a7fa", "Mqc"));
    colors.push(AddToCssColor("fbcb43", "Jqc"));
    colors.push(AddToCssColor("e46f61", "WRa"));
    colors.push(AddToCssColor("4dbfd9", "Tqc"));
    colors.push(AddToCssColor("8cc474", "Hqc"));
    colors.push(AddToCssColor("bc5679", "CVb"));
    return colors;
}


function AddToCssColor(name, cssclass)
{
    var col = hexToRGB(name);

    var colorData = new Object();
    colorData.Name = name;
    colorData.Color = "rgb(" + col[0] + ", " + col[1] + ", " + col[2] + ")";
    colorData.CssClass = cssclass;
    return colorData;
}