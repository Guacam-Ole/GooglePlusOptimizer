var gpoUser=function() {
    this.UserColorTimeout;
    this.AllCssColors;
    this.AllUserSettings;
};


gpoUser.prototype = {
    constructor: gpoUser,
    Init:function() {
        this.OptStartColors();
        this.PaintColorBlock();
    },
    Dom:function($ce) {
        this.PaintForUser($ce);        
        
        this.PaintCurrentUserSettings($ce);
    },
    OptStartColors:function() {
        this.AllCssColors = this.GetCssColors();
        this.GetAllUserSettings();
        console.log("Color loaded.");
    },
    PaintColorBlock:function() {
        var obj=this;
        if (document.URL.indexOf("about") === -1 && document.URL.indexOf("posts") === -1)
        {
            return;
        }
        if ($(".colorUsers").length > 0 || $('[ guidedhelpid="profile_name"]').length === 0)
        {
            return;
        }
        $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("./setup/css/user.css") + "' type='text/css' media='screen' />"));
        var userName = obj.GetUserName();
        var colorBlock = "<br><table class=\"colorUsers\"><tbody><tr><td class=\"usrWhite colClick\">✓</td><td class=\"usrBlue colClick\">&nbsp;</td><td class=\"usrYellow colClick\">&nbsp;</td><td class=\"usrRed colClick\">&nbsp;</td><td class=\"usrCyan colClick\">&nbsp;</td><td class=\"usrGreen colClick\">&nbsp;</td><td class=\"usrMagenta colClick\">&nbsp;</td></tr></tbody></table>";
        var userInfo = "<input type=\"text\" class=\"userRemark\" placeholder=\"" + chrome.i18n.getMessage("RemarkPlaceholder") + "\" />";
        $('[guidedhelpid="profile_name"]').parent().append(colorBlock + userInfo.replace('__USER__', userName));
        $('.colClick').click(function() {
            obj.RemoveSelection();
            $(this).append("✓");
            obj.UpdateUserData();
        });
        $('.userRemark').change(function() {
            obj.UpdateUserData();
        });
    },PaintForUser:function($ce) {
        var obj=this;
        if (obj.AllUserSettings=== null || obj.AllUserSettings=== undefined) {
            return;
        }

        for (var i in obj.AllUserSettings) {
            var currentUserSetting=obj.AllUserSettings[i];
            if (currentUserSetting.Color !== "rgb(0, 0, 0)" && currentUserSetting.Color !== "rgba(0, 0, 0, 0)") {
                // Einfärben
                var paintColor= $.grep(obj.AllCssColors, function(e){ return e.Color === currentUserSetting.Color; });
                if (paintColor.length>0) {
                    $ce.find('h3 [oid="' + currentUserSetting.UserId + '"]').closest('[role="article"]').addClass("vna");
                    $ce.find('h3 [oid="' + currentUserSetting.UserId + '"]').closest('[role="article"]').addClass(paintColor[0].CssClass);
                }
            }
            if (currentUserSetting.Text !== null && currentUserSetting.Text !== undefined && currentUserSetting.Text !== "") {
                if ($ce.find('h3 [oid="' + currentUserSetting.UserId + '"]').closest('.lea').length > 0) {
                    $ce.find('h3 [oid="' + currentUserSetting.UserId + '"]').closest('.lea').each(function() {
                        AddHeadWrapper($(this));
                        if ($(this).html().indexOf('infoImg') === -1) {
                            $(this).find('.InfoUsrTop').prepend("<img class=\"infoImg\" title=\"" + currentUserSetting.Text + "\" src=\"" + chrome.extension.getURL('setup/images/icons/small/info_24_hot.png') + "\" />");
                        }
                    });
                }
            }
        }
    },
    GetUserName:function() {
        return $('[guidedhelpid="profile_name"]').html();
    },
    PaintCurrentUserSettings:function(obj) {
        if (document.URL.indexOf("about") === -1 && document.URL.indexOf("posts") === -1)
        {
            return;
        }
        if ($(".colorUsers").length > 0 || $('[ guidedhelpid="profile_name"]').length === 0)
        {
            return;
        }
        if (obj===undefined) {
            obj=this;
        }
        var currentUserSettings = obj.GetCurrentUserSettings() || null;
        if (currentUserSettings === null) {
            return; // Noch keine Einstellungen
        }

        var usrText = currentUserSettings.Text;
        $('.userRemark').val(usrText);
        var usrColor = currentUserSettings.Color;

        $('.colorUsers td').each(function() {
            var color = $(this).css("background-color");
            if (color === usrColor) {
                obj.RemoveSelection();
                $(this).append("✓");
            }
        });
    },
    GetCurrentUserId:function() {
        var dirtyId = $('[role=tablist]').attr("id");
        return dirtyId.split('-')[0];
    },
    RemoveSelection:function () {
        $('.colorUsers td').each(function() {
            $(this).html("");
        });
    },
    GetCurrentUserSettings:function() {
        var obj=this;
        var currentUserId = obj.GetCurrentUserId();
        var userSettings = obj.AllUserSettings;
        if (userSettings === null || userSettings === undefined)
        {
            return null;
        }
        for (var i in userSettings) {
            if (userSettings[i].UserId === currentUserId) {
                userSettings[i].I = i; // Dummy value für index
                return userSettings[i];
            }
        }
    },
    SaveAllUserSettings:function(allUserSettings) {
        chrome.runtime.sendMessage( {
                Action: "SaveUsers", ParameterValue: JSON.stringify(allUserSettings)
            });
    },
    GetSettingsObject:function(i, remark, color) {
        var obj=this;
        var currentSettingObject = new Object();
        currentSettingObject.I = i;
        currentSettingObject.Text = remark;
        currentSettingObject.Color = color;
        currentSettingObject.UserId = obj.GetCurrentUserId();
        return currentSettingObject;
    },
    AddUserSettings:function(remark, color) {
        var obj=this;
        var allUserSettings = obj.AllUserSettings;
        if (allUserSettings === null || allUserSettings === undefined) {
            allUserSettings = [];
        }
        var currentSettingsObject = obj.GetSettingsObject(-1, remark, color);
        allUserSettings.push(currentSettingsObject);
        obj.SaveAllUserSettings(allUserSettings);
    },RemoveUserSettigns:function(i) {
        var obj=this;
        var allUserSettings = obj.AllUserSettings;
        allUserSettings.splice(i, 1);
        obj.SaveAllUserSettings(allUserSettings);
    },
    UpdateUserSettings:function(i, remark, color) {
        var obj=this;
        var allUserSettings = obj.AllUserSettings;
        var currentSettingsObject = obj.GetSettingsObject(i, remark, color);
        allUserSettings[i] = currentSettingsObject;
        obj.SaveAllUserSettings(allUserSettings);
    },
    UpdateUserData:function() {
        var obj=this;
        var userRemark = $('.userRemark').val();
        var selectedColor;
        var removeData = (($('.usrWhite').val() === '✓') && userRemark.trim() === "");

        $('.colorUsers td').each(function() {
            if ($(this).html() === "✓") {
                selectedColor = $(this).css("background-color");
            }
        });
        // Alte Daten laden:
        var currentUserSettings = obj.GetCurrentUserSettings();
        if (currentUserSettings === null || currentUserSettings === undefined) {
            if (removeData) {
                return; // Nichts zu tun
            }
            obj.AddUserSettings(userRemark, selectedColor);  // Einstellung hinzufügen
        } else {
            if (removeData) {
                obj.RemoveUserSettings(currentUserSettings.I);
            } else {
                obj.UpdateUserSettings(currentUserSettings.I, userRemark, selectedColor);
            }
        }
    },
    GetAllUserSettings:function() {
        var obj=this;
        chrome.runtime.sendMessage({
            Action: "LoadUsers"
        }, function(response) {
            obj.AllUserSettings= JSON.parse(response.AllUserSettings);
            obj.PaintForUser();
            //obj.PaintColorBlock();            
        });
    },HexToR:function(h) {
        var obj=this;
        return parseInt((obj.CutHex(h)).substring(0, 2), 16);
    },HexToG:function(h) {
        var obj=this;
        return parseInt((obj.CutHex(h)).substring(2, 4), 16);
    },HexToB:function(h) {
        var obj=this;
        return parseInt((obj.CutHex(h)).substring(4, 6), 16);
    },CutHex:function(h) {
        var obj=this;
        return (h.charAt(0) === "#") ? h.substring(1, 7) : h;
    },HexToRGB:function(hex) {
        var obj=this;
        var r = obj.HexToR(hex);
        var g = obj.HexToG(hex);
        var b = obj.HexToB(hex);
        return [r, g, b];
    },
    GetCssColors:function() {
        var obj=this;
        var colors = [];
        colors.push(obj.AddToCssColor("76a7fa", "Mqc"));
        colors.push(obj.AddToCssColor("fbcb43", "Jqc"));
        colors.push(obj.AddToCssColor("e46f61", "WRa"));
        colors.push(obj.AddToCssColor("4dbfd9", "Tqc"));
        colors.push(obj.AddToCssColor("8cc474", "Hqc"));
        colors.push(obj.AddToCssColor("bc5679", "CVb"));
        return colors;
    },
    AddToCssColor:function(name, cssclass) {
        var obj=this;
        var col = obj.HexToRGB(name);
        var colorData = new Object();
        colorData.Name = name;
        colorData.Color = "rgb(" + col[0] + ", " + col[1] + ", " + col[2] + ")";
        colorData.CssClass = cssclass;
        return colorData;
    }
};