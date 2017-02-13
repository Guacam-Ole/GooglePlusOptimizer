var gpoLsr = function () {
    this.DomainBlackList = [];
};

gpoLsr.prototype = {
    constructor: gpoLsr,
    Init: function () {
        this.LoadLsrList();
    },
    Dom: function ($ce) {
        this.MarkLinks($ce);
    },
    LoadLsrList: function () {
        var obj = this;
        var domainBlacklist = localStorage.getItem("domainBlacklist");
        var lastLsrDownload = localStorage.getItem("lastLsrDownload");
        if (lastLsrDownload === undefined || lastLsrDownload === null || Date.parse(CleanDate(lastLsrDownload)) < (7).days().ago() || domainBlacklist === undefined || domainBlacklist === null) {
            $.getJSON('https://cdn.rawgit.com/magdev/leistungsschutzgelderpresser/master/domains.json', function (domains) {
                obj.DomainBlacklist = domains;
                localStorage.setItem("lastLsrDownload", Date.today());
                localStorage.setItem("domainBlacklist", JSON.stringify(obj.DomainBlacklist));
                console.log("LSR-Domains read");
            });
        } else {
            obj.DomainBlacklist = JSON.parse(domainBlacklist);
        }
    },
    MarkLinks: function ($ce) {
        if (this.DomainBlacklist === undefined) {
            return;
        }
        var obj = this;
        var mark = function ($el) {


                $el.find('.wftCae')
                    .not('.wrng')
                    .addClass('wrng')
                    .prepend($('<div style="background-color:red;color:white;text-align:center;font-weight:bold;letter-spacing:0.1em;">' + chrome.i18n.getMessage('WARNING') + '</div>'));


        };

        var markComment = function ($el) {
                $el.not('.wrng')
                    .addClass('wrng')
                    .before($('<div style="background-color:red;font-size: 8pt;color:white;text-align:center;font-weight:bold;letter-spacing:0.1em;">' + chrome.i18n.getMessage('WARNING') + '</div>'));

        };

        // Hauptbeitrag:
            $ce.find('[role="main"] a').each(function (i, div) {
                obj.DomainBlacklist.forEach(function (domain) {
                    if (div.href.indexOf(domain + "/") > -1 || div.href.substr(-1, 1) === domain) {
                        mark($(div).closest('.ELUvyf'));
                    }
                });
            });

        // Kommentare:
            $ce.find('.M24KRd a').each(function (i, div) {
                obj.DomainBlacklist.forEach(function (domain) {
                    if (div.href.indexOf(domain + "/") > -1 || div.href.substr(-1, 1) === domain) {
                        markComment($(div).closest("li.M24KRd"));
                    }
                });
            });
    }
};

