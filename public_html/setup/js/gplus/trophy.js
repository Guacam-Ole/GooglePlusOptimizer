var gpoTrophy=function() {
    this.AllTrophies=null;
    this.AllUsers=null;
};

gpoTrophy.prototype= {
    constructor: gpoTrophy,
    Init:function() {
        var obj=this;
        $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("./setup/css/trophy.css") + "' type='text/css' media='screen' />"));
        obj.GetUsers();
    
        $(document).on({
            click: function () {
                if ($(this).closest('.InfoUsrTop').parent().find('.trophyDisplay').length>0) {
                    $(this).closest('.InfoUsrTop').parent().find('.trophyDisplay').remove();
                } else {
                   obj.Hover($(this));
                }
                return false;
            }
        }, ".trophyImg"); //pass the element as an argument to .on
       
    },
    Dom:function() {
        this.About();
        this.Stream();
    },
    Hover:function($trophy)  {
        this.Draw(true, $trophy, $trophy.attr("userid"));
    },
    About:function() {
        var obj=this;
        $(document).ready(function() {
            if (window.location.pathname.indexOf("/about") > 0) {
                if ($('.trophyDisplay').length > 0) {
                    // schon gezeichnet
                    return;
                } else {
                    obj.Draw(false, null, GetCurrentUserId());
                }
            }
        });
    },
    Draw:function(hover, $trophy, userId) {
        var obj=this;
        chrome.runtime.sendMessage( {
           Action: "getTrophiesForUser",
           UserId: userId
        }, function(response) {
            if (response.Result.length>0) {
                var trophies=response.Result;

                if (obj.AllTrophies===null || obj.AllTrophies===undefined) {
                    // Beschreibungen auslesen:
                    chrome.runtime.sendMessage(
                    {
                        Action: "getTrophyDescriptions",
                        Language: chrome.i18n.getMessage("lang")
                    }, function(response)
                    {
                        obj.AllTrophies=response.Result;
                        obj.DoDrawing(hover,trophies,$trophy, userId);
                    });
                } else {
                    obj.DoDrawing(hover,trophies,$trophy, userId);
                }                
            } else {

               obj.RenderEmpty();
            }
       });
    },
    DoDrawing:function(hover, trophies, $trophy, userId) {
        var obj=this;
        if (hover) {
            
            obj.RenderHover( trophies,$trophy.closest('.InfoUsrTop').next(),userId,false);
        } else {
            if ($('.trophyDisplay').length > 0) {
                // schon gezeichnet
                return;
            }

            obj.RenderHover(trophies, $('.Ypa.jw.am:first'),userId, true);  
        }
    },
    ItsMe:function() {
        return $('[guidedhelpid="profile_viewas_button"]').length>0;
    },
    RenderEmpty:function() {
        if ($('.trophyDisplay').length > 0) {
            // schon gezeichnet
            return;
        }
        var itsmeblock="";
        var noTrophiesYet="";


        var html = "<div  class=\"trophyDisplay Ee i5a vna CVb\" role=\"article\">"
                   + "<div class=\"ZYa ukoEtfi\"><div class=\"Lqc\"><div class=\"F9a\">" + chrome.i18n.getMessage("trophies") + "</div></div><br/><br/>"
                   + "<div class=\"Uia\">"
                   + "{{NOTROPHY}}"
                   + "</div>{{ITSME}}</div>";

        if (ItsMe()) {
            itsmeblock="<div class='moredetails'><a href='http://www.appschleppen.com/index."+chrome.i18n.getMessage("lang")+".php#collect'>"+chrome.i18n.getMessage("letsgo")+"</div>";
            noTrophiesYet=chrome.i18n.getMessage("youhavenotrophies");
        } else {
            noTrophiesYet=GetUserName()+" "+chrome.i18n.getMessage("hasnotrophies");
        }
        html=html.replace("{{ITSME}}",itsmeblock).replace("{{NOTROPHY}}",noTrophiesYet);
        $('.Ypa.jw.am:first').prepend(html);
    },
    GetUsers:function() {
        var obj=this;
        var lastTrophyDownload=localStorage.getItem("lastTrophyDownload");
        var allTrophyUsers=localStorage.getItem("allTrophyUsers");
        if (lastTrophyDownload===undefined || lastTrophyDownload===null  || Date.parse(CleanDate(lastTrophyDownload))<(1).days().ago() || allTrophyUsers==null || allTrophyUsers==undefined) {
            chrome.runtime.sendMessage( {
                Action: "getTrophyUsers"
            }, function(response) {
                obj.AllUsers = response.Result;        
                localStorage.setItem("allTrophyUsers",JSON.stringify(obj.AllUsers));
                localStorage.setItem("lastTrophyDownload",Date.today());
            });
        } else {
            obj.AllUsers=JSON.parse(allTrophyUsers);
        }
    },
    Stream:function() {
        var obj=this;
        if (obj.AllUsers!==undefined && obj.AllUsers!==null && obj.AllUsers.length>0) {
            for (var i in obj.AllUsers) {
                var currentUser=obj.AllUsers[i].id;
                if ($('h3 [oid="' + currentUser + '"]').closest('.lea').length > 0) {
                    $('h3 [oid="' + currentUser + '"]').closest('.lea').each(function() {
                        AddHeadWrapper($(this));
                        if ($(this).html().indexOf('trophyImg') === -1)
                        {
                            $(this).find('.InfoUsrTop').prepend("<a href=\"#\"><img class=\"trophyImg\" userId='"+currentUser+"' title=\"" + chrome.i18n.getMessage("HasTrophies") + "\" src=\"" + chrome.extension.getURL('setup/images/icons/small/trophy_24.png') + "\" />");
                        }
                    });
                }
            }
        }
    },
    GetObject:function(id, alltrophies) {
        var obj=this;
        var result = $.grep(alltrophies, function(e) {
            return e.id === id.short;
        });
        
        return result[0];    
    },
    RenderHover:function(trophies, parent, currentUserId, toTheTop) {
        var obj=this;
        console.log("render trophies");
        trophies= trophies|| null;
        var goldHtml = "";
        var silverHtml = "";
        var bronzeHtml = "";

        if (trophies !== null) {
            var goldTrophies = [];
            var silverTrophies = [];
            var bronzeTrophies = [];

            for (var i in trophies)
            {
                var trophy = trophies[i];
                if (trophy.isGold==="1")
                {
                    goldTrophies.push(trophy);
                } else if (trophy.isSilver==="1")
                {
                    silverTrophies.push(trophy);
                } else if (trophy.isBronze==="1")
                {
                    bronzeTrophies.push(trophy);
                }
            }
            if (goldTrophies.length > 0)
            {
                goldHtml = "<div class=\"trophyRow trophyGold\" title=\"" + chrome.i18n.getMessage("goldTrophies") + "\">";
                for (var i in goldTrophies)
                {
                    var trophy = goldTrophies[i];
                    var trophyDetails = obj.GetObject(trophy, obj.AllTrophies.gold);
                    goldHtml += "<span title=\"" + trophyDetails.title + "\" class=\"badge gold\">" + trophyDetails.name + "</span>";
                }
                goldHtml += "</div>";
            }
            if (silverTrophies.length > 0)
            {
                silverHtml = "<div class=\"trophyRow trophySilber\" title=\"" + chrome.i18n.getMessage("silverTrophies") + "\">";
                for (var i in silverTrophies)
                {
                    var trophy = silverTrophies[i];
                    var trophyDetails = obj.GetObject(trophy, obj.AllTrophies.silber);
                    silverHtml += "<span title=\"" + trophyDetails.title + "\" class=\"badge silber\">" + trophyDetails.name + "</span>";
                }
                silverHtml += "</div>";
            }
            if (bronzeTrophies.length > 0)
            {
                bronzeHtml = "<div class=\"trophyRow trophyBronze\" title=\"" + chrome.i18n.getMessage("bronzeTrophies") + "\">";
                for (var i in bronzeTrophies)
                {
                    var trophy = bronzeTrophies[i];
                    var trophyDetails = obj.GetObject(trophy, obj.AllTrophies.bronze);
                    bronzeHtml += "<span title=\"" + trophyDetails.title + "\" class=\"badge bronze\">" + trophyDetails.name + "</span>";
                }
                bronzeHtml += "</div>";
            }
            var html = "<div  class=\"trophyDisplay Ee i5a vna CVb\" role=\"article\">"
                    + "<div class=\"ZYa ukoEtfi\"><div class=\"Lqc\"><div class=\"F9a\">" + chrome.i18n.getMessage("trophies") + "</div></div><br/><br/>"
                    + "<div class=\"Uia\">"
                    + goldHtml
                    + silverHtml
                    + bronzeHtml
                    + "</div><div class='moredetails'><a href='http://www.appschleppen.com/index."+chrome.i18n.getMessage("lang")+".php?userId="+currentUserId+"'>" + chrome.i18n.getMessage("moredetails") + "</a></div></div>";
            if (toTheTop) {
                $(parent).prepend(html);
            } else {
                $(parent).append(html);
            }
        }
    }
};
