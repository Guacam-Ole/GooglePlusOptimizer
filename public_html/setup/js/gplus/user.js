var gpoUser = function () {
    this.UserColorTimeout;
    this.AllCssColors;
    this.AllUserSettings;
};


gpoUser.prototype = {
    constructor: gpoUser,
    Init: function () {
        this.OptStartColors();
    },
    Dom: function ($ce) {
        this.PaintColorBlock();
        this.PaintForUser($ce);
    //    this.PaintCurrentUserSettings();
    },
    OptStartColors: function () {
       // this.AllCssColors = this.GetCssColors();
        //this.GetAllUserSettings();
        console.log("GPO: Usercolors loaded.");
    },
    PaintColorInner:function () {
        var obj=this;
        if ($(".colorUsers").length > 0) {
            // schon gepinselt
            return;
        }
        var userName = obj.GetUserName();
        if (!userName) return;

        $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("./setup/css/user.css") + "' type='text/css' media='screen' />"));

        var wrapper="<div role='region' id='colorUsersContainer' aria-label='Google+ Optimizer Colorbox'><c-wiz>__HEADER____BODY__</c-wiz></div>" ;
        var header="<div class='aPExg'><div class='t1KkGe AipWwc'><div class='xRbTYb'>Google+ - Optimizer Colorbox </div></div></div>";
        var body="<div class='aPExg'><div class='t1KkGe AipWwc'><div>__INFO__<br/></div></div></div>";

        var colorBlock = "<table class=\"colorUsers\"><tbody><tr><td class=\"usrWhite colClick\">✓</td><td class=\"usrBlue colClick\">&nbsp;</td><td class=\"usrYellow colClick\">&nbsp;</td><td class=\"usrRed colClick\">&nbsp;</td><td class=\"usrCyan colClick\">&nbsp;</td><td class=\"usrGreen colClick\">&nbsp;</td><td class=\"usrMagenta colClick\">&nbsp;</td></tr></tbody></table>";
        var colorBlock=obj.PaintTable();
        var userInfo = "<input type=\"text\" class=\"userRemark\" placeholder=\"" + chrome.i18n.getMessage("RemarkPlaceholder") + "\" />";
        body=body.replace("__INFO__",colorBlock + userInfo.replace('__USER__', userName));

        wrapper=wrapper.replace("__HEADER__",header).replace("__BODY__",body);
        var $completeBlock = $(wrapper);

        setTimeout(function () {
            // Wait for Blocks to be finished;
            obj.PaintCurrentUserSettings($completeBlock);
        },1000);

        $('.JXv70c').prepend($completeBlock);
        $('.colClick').click(function () {
            obj.RemoveSelection();
            $(this).append("✓");
            obj.UpdateUserData(false);
        });
        $('.colClickRemove').click(function () {
            obj.RemoveSelection();
            obj.UpdateUserData(true);
        });
    },
    PaintColorBlock: function () {
        var obj = this;
        var meta=$('[itemtype="https://schema.org/Person"]');
        if (!meta || meta.length==0) return;
        var container=$('#colorUsersContainer');
        if (container) {
            $.when(container.remove()).then(function () {
                obj.PaintColorInner();
            });
        } else {
            obj.PaintColorInner();
        }
    },
    PaintTd:function(h,s,l) {
        var retval="<td class='colClick' style='font-weight:bold;__FRONTSTYLE__;background-color:hsl("+h+","+s+"%,"+l+"%);'>&nbsp;</td>";
        if (l<50) {
          return retval.replace('__FRONTSTYLE__','color:white');
        }
        return retval.replace('__FRONTSTYLE__','color:black');
    },

    PaintTr:function (l) {
        var tds="";
        var h=0;
        while (h<360) {
            tds+=this.PaintTd(h,100,l);
            h+=10;
        }

        return "<tr>"+tds+"</tr>";
    },
    PaintTable:function () {
        return "<table class='colorUsers'><tr><td colspan='36' class='colClickRemove'>Nicht hervorheben</td> </tr>"+this.PaintTr(30)+this.PaintTr(50)+this.PaintTr(85)+"</table>";
    },
    CleanForUser:function ($ce) {
        var profile= $ce.find('a[data-profileid="' + this.GetCurrentUserId() + '"]');
        if (profile && profile.length>0 ) {
            profile.closest('.Ihwked').css("border","");
            profile.closest('.Ihwked').css("border-top","");
        }
    },
    PaintForUser: function ($ce) {
        var obj = this;

        if (obj.AllUserSettings === null || obj.AllUserSettings === undefined) {
            return;
        }

        for (var i in obj.AllUserSettings) {
            var currentUserSetting = obj.AllUserSettings[i];
            // Einfärben
            var profile= $ce.find('a[data-profileid="' + currentUserSetting.UserId + '"]');
            if (profile && profile.length>0 ) {
                profile.closest('.Ihwked').css("border","solid 2px " + currentUserSetting.Color);
                profile.closest('.Ihwked').css("border-top","solid 30px " + currentUserSetting.Color);
            }
        }
    },
    GetUserName: function () {
            var names=$('meta[itemprop="name"]');
        if (!names || names.length==0) return undefined;
        return names[names.length-1].content;
    },
    PaintCurrentUserSettings: function ($ce) {
        var obj = this;
        if ($ce === undefined) {
            $ce = $(document);
        }
        var meta=$('[itemtype="https://schema.org/Person"]');
        if (!meta) return;

        if ($(".colorUsers").length === 0) return;

        var currentUserSettings = this.GetCurrentUserSettings() || null;
        if (currentUserSettings === null) {
            return; // Noch keine Einstellungen
        }

        var usrText = currentUserSettings.Text;
        $ce.find('.userRemark').val(usrText);
        var usrColor = currentUserSettings.Color;

        $ce.find('.colorUsers td').each(function () {
            var color = $(this).css("background-color");
            if (color === usrColor) {
                obj.RemoveSelection();
                $(this).append("✓");
            }
        });
    },
    GetCurrentUserId: function () {
        var idElements=$('.uyYuVb');
        if (!idElements || idElements.length==0) return;
        return $(idElements[idElements.length-1]).data('oid');
    },
    RemoveSelection: function () {
        $('.colorUsers td.colClick').each(function () {
            $(this).html("");
        });
    },
    GetCurrentUserSettings: function () {
        var obj = this;
        var currentUserId = obj.GetCurrentUserId();
        var userSettings = obj.AllUserSettings;
        if (userSettings === null || userSettings === undefined || currentUserId===null) {
            return null;
        }
        for (var i in userSettings) {
            if (userSettings[i].UserId === currentUserId) {
                userSettings[i].I = i; // Dummy value für index
                return userSettings[i];
            }
        }
    },
    SaveAllUserSettings: function (allUserSettings) {
        chrome.runtime.sendMessage({
            Action: "SaveUsers", ParameterValue: JSON.stringify(allUserSettings)
        });
    },
    GetSettingsObject: function (i, remark, color) {
        var obj = this;
        var currentSettingObject = new Object();
        currentSettingObject.I = i;
        currentSettingObject.Text = remark;
        currentSettingObject.Color = color;
        currentSettingObject.UserId = obj.GetCurrentUserId();
        return currentSettingObject;
    },
    AddUserSettings: function (remark, color) {
        var obj = this;
        var allUserSettings = obj.AllUserSettings;
        if (allUserSettings === null || allUserSettings === undefined) {
            allUserSettings = [];
        }
        var currentSettingsObject = obj.GetSettingsObject(-1, remark, color);
        allUserSettings.push(currentSettingsObject);
        obj.SaveAllUserSettings(allUserSettings);
    }
    , RemoveUserSettings: function (i) {
        var obj = this;
        var allUserSettings = obj.AllUserSettings;
        allUserSettings.splice(i, 1);
        obj.SaveAllUserSettings(allUserSettings);
    },
    UpdateUserSettings: function (i, remark, color) {
        var obj = this;
        var allUserSettings = obj.AllUserSettings;
        var currentSettingsObject = obj.GetSettingsObject(i, remark, color);
        allUserSettings[i] = currentSettingsObject;
        obj.SaveAllUserSettings(allUserSettings);
    },

    UpdateUserData: function (removeData) {
        var obj = this;
        var userRemark = $('.userRemark').val();
        var selectedColor;

        $('.colorUsers td').each(function () {
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
            $('c-wiz').each(function () {
                obj.PaintForUser($(this));
            })
        } else {
            if (removeData) {
                obj.RemoveUserSettings(currentUserSettings.I);
                $('c-wiz').each(function () {
                    obj.CleanForUser($(this));
                })
            } else {
                obj.UpdateUserSettings(currentUserSettings.I, userRemark, selectedColor);
                $('c-wiz').each(function () {
                    obj.PaintForUser($(this));
                })
            }
        }
    }

};