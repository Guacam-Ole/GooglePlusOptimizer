

function OptStartTrophyDisplay() {
    $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("./setup/css/trophy.css") + "' type='text/css' media='screen' />"));
    GetTrophyUsers();
    
    $(document).on({
        click: function () {
            if ($(this).closest('.InfoUsrTop').parent().find('.trophyDisplay').length>0) {
                $(this).closest('.InfoUsrTop').parent().find('.trophyDisplay').remove();
            } else {
               HoverTrophies($(this));
            }
            return false;
        }
    }, ".trophyImg"); //pass the element as an argument to .on
}


function HoverTrophies($trophy) {
     var userId=$trophy.attr("userid");
    
     chrome.runtime.sendMessage(
    {
        Action: "getTrophiesForUser",
        UserId: userId
    }, function(response)
    {
        if (response.Result.length>0) {
            trophies=response.Result;

            // Beschreibungen auslesen:
            chrome.runtime.sendMessage(
            {
                Action: "getTrophyDescriptions",
                Language: chrome.i18n.getMessage("lang")
            }, function(response)
            {
                allTrophies=response.Result;
                
                RenderTrophyBlockHover(allTrophies, trophies,$trophy.closest('.InfoUsrTop').next(),userId,false);
            });
        } else {

           RenderEmptyTrophyBlock();
        }
    });
}




/**
 * Trophäen darstelen
 */
function DrawTrophies()
{
    $(document).ready(function()
    {
        if (window.location.pathname.indexOf("/about") > 0)
        {
           try {
                if ($('.trophyDisplay').length > 0) {
                    // schon gezeichnet
                    return;
                }
                GetTrophyUsers();
                var userId=GetCurrentUserId();
                chrome.runtime.sendMessage(
                {
                    Action: "getTrophiesForUser",
                    UserId: userId
                }, function(response)
                {
                    if (response.Result.length>0) {
                        trophies=response.Result;
                        
                        // Beschreibungen auslesen:
                        chrome.runtime.sendMessage(
                        {
                            Action: "getTrophyDescriptions",
                            Language: chrome.i18n.getMessage("lang")
                        }, function(response)
                        {
                            allTrophies=response.Result;
                            //$("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("./setup/css/trophy.css") + "' type='text/css' media='screen' />"));
                            RenderTrophyBlock(allTrophies, trophies);
                        });
                    } else {
                        
                       RenderEmptyTrophyBlock();
                    }
                });
            } catch (ex) {
                console.log(ex);
            }
        }
    });
}

function ItsMe() {
    return $('[guidedhelpid="profile_viewas_button"]').length>0;
}



function RenderEmptyTrophyBlock() {
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
}

function PaintTrophyOverview() {
    
    if (Subs.Settings.Values.DisplayTrophy) {
        var allusers=JSON.parse(localStorage.getItem("allTrophyUsers"));
        if (allusers!=undefined && allusers!=null && allusers.length>0) {
            for (var i in allusers) {
                var currentUser=allusers[i].id;
                if ($('h3 [oid="' + currentUser + '"]').closest('.lea').length > 0)
                {
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
    }
}

 function GetTrophyUsers() {
     var lastTrophyDownload=localStorage.getItem("lastTrophyDownload");
     var allTrophyUsers=localStorage.getItem("allTrophyUsers");
     if (lastTrophyDownload===undefined || lastTrophyDownload===null  || Date.parse(CleanDate(lastTrophyDownload))<(1).days().ago() || allTrophyUsers==null || allTrophyUsers==undefined) {
        chrome.runtime.sendMessage( {
            Action: "getTrophyUsers"
        }, function(response)
        {
            allTrophyUsers = response.Result;        
            localStorage.setItem("allTrophyUsers",JSON.stringify(allTrophyUsers));
            localStorage.setItem("lastTrophyDownload",Date.today());
        });
    }
 }  



/**
 * Trophäendetails bestimmen
 * @param {string} id TrophäenID
 * @param {Array} alltrophies Alle Trophäen
 * @returns {GetTrophyObject.result} Trophäe
 */
function GetTrophyObject(id, alltrophies) {
    var result = $.grep(alltrophies, function(e) {
        return e.id === id.short;
    });
    return result[0];
}

function RenderTrophyBlockHover(allTrophies, trophies, parent, currentUserId, tothetop) {
    console.log("render trophies");
 //   try {
        trophies = trophies || null;
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
                    var trophyDetails = GetTrophyObject(trophy, allTrophies.gold);
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
                    var trophyDetails = GetTrophyObject(trophy, allTrophies.silber);
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
                    var trophyDetails = GetTrophyObject(trophy, allTrophies.bronze);
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
            if (tothetop) {
                $(parent).prepend(html);
            } else {
                $(parent).append(html);
            }
        }
 //   } catch (ex) {
  //      console.log(ex);
  //  }
}

/**
 * Trophäenblock rendern
 */
function RenderTrophyBlock(allTrophies, trophies) {
    if ($('.trophyDisplay').length > 0) {
        // schon gezeichnet
        return;
    }

    RenderTrophyBlockHover(allTrophies, trophies, $('.Ypa.jw.am:first'),GetCurrentUserId(),true);
}
