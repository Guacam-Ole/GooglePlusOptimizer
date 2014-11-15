
function LoadLsrList() {
    if (objSettings.Values.MarkLSRPosts) {
        domainBlacklist=localStorage.getItem("domainBlacklist");
        var lastLsrDownload=localStorage.getItem("lastLsrDownload");
        if (lastLsrDownload==undefined || lastLsrDownload==null  || Date.parse(CleanDate(lastLsrDownload))<(7).days().ago() || domainBlacklist==undefined || domainBlacklist==null  ) {
            $.getJSON('https://cdn.rawgit.com/magdev/leistungsschutzgelderpresser/master/domains.json', function(domains) {
                domainBlacklist = domains;
                localStorage.setItem("lastLsrDownload",Date.today());
                localStorage.setItem("domainBlacklist",JSON.stringify(domainBlacklist));
                console.log("LSR-Domains read");
            });
        } else {
           domainBlacklist=JSON.parse(domainBlacklist); 
        }
    }
}




function DOMMarkLSRLinks() {
    if (objSettings.Values.MarkLSRPosts) {
        
         var mark = function($el) {
            $el.find('div[jsname="P3RoXc"]')
                    .not('.wrng')
                    .addClass('wrng')
                    .prepend($('<div style="background-color:red;color:white;text-align:center;font-weight:bold;letter-spacing:0.1em;">' + chrome.i18n.getMessage('WARNING') + '</div>'));
        };
        
        var markComment=function($el) {
            $el
                    .not('.wrng')
                    .addClass('wrng')
                    .prepend($('<div style="background-color:red;font-size: 8pt;color:white;text-align:center;font-weight:bold;letter-spacing:0.1em;">' + chrome.i18n.getMessage('WARNING') + '</div>'));

        };

         // Hauptbeitrag:
        $('div.Xx.xJ a').each(function(i, obj) {
            domainBlacklist.forEach(function(domain) {
                if (obj.href.indexOf(domain+"/") > -1 || obj.href.substr(-1,1) == domain ) {
                    mark($(obj).closest("div.Yp.yt.Xa"));
                }
            });
        });
        $('div.yx.Nf a').each(function(i, obj) {
            domainBlacklist.forEach(function(domain) {
                if (obj.href.indexOf(domain+"/") > -1 || obj.href.substr(-1,1) == domain ) {
                    mark($(obj).closest("div.Yp.yt.Xa"));
                }
            });
        });
        
        // Kommentare:
         $('div.Ik.Wv a').each(function(i, obj) {
            domainBlacklist.forEach(function(domain) {
                if (obj.href.indexOf(domain+"/") > -1 || obj.href.substr(-1,1) == domain ) {
                    markComment($(obj).closest("div.Ik.Wv"));
                }
            });
        });
        
         
    }
}



