var gpoDomainBlock = function (log) {
    this.Lsr = {
        Enabled:false,
        List:[],
        Back:"red",
        Front:"white",
        Text:"Seite unterstützt LSR",
        Storage:"lsrList",
        Url:"https://cdn.rawgit.com/magdev/leistungsschutzgelderpresser/master/domains.json"
    };
    this.Adblock={
        Enabled:false,
        List:[],
        Back:"red",
        Front:"white",
        Text:"Seite besitzt AdBlock-Erkennung",
        Storage:"adblockList",
        Url:"https://cdn.rawgit.com/magdev/leistungsschutzgelderpresser/master/domains.json"
    };
    this.Custom= {
        Enabled:false,
        List: [],
        Back:"red",
        Front:"white",
        Text: "Favoriten-Link",
        Storage:"customList"
    };
    this.Log=log;
};

gpoDomainBlock.prototype = {
    constructor: gpoDomainBlock,
    Init: function (settings) {
        this.Log.Debug("Domainfilter Init");
        if (settings.MarkLSR) {
            this.EnableObject(this.Lsr, settings.MarkLSRBack, settings.MarkLSRFront, settings.MarkLSRText);
        }
        if (settings.MarkAdblock) {
            this.EnableObject(this.Adblock, settings.MarkAdblockBack, settings.MarkAdblockFront, settings.MarkAdblockText);
        }
        if (settings.MarkCustom) {
            this.EnableObject(this.Custom, settings.MarkCustomBack, settings.MarkCustomFront, settings.MarkCustomText);
        }
    },
    EnableObject:function (obj, back, front, text) {
        obj.Enabled=true;
        if (back) {
            obj.Back=back;
        }
        if (front) {
            obj.Front=front;
        }
        if (text) {
            obj.Text=text;
        }
        this.Log.Debug(obj.Storage+" enabled");
        this.LoadAnyList(obj);
    },
    Dom: function ($ce) {
        if (this.Lsr.Enabled) {
            this.MarkLinks($ce, this.Lsr);
        }
        if (this.Adblock.Enabled) {
            this.MarkLinks($ce, this.Adblock);
        }
        if (this.Custom.Enabled) {
            this.MarkLinks($ce, this.Custom);
        }
    },

    LoadCustomList:function() {
        // TODO: Von Background-Site abfragen
    },
    LoadAnyList:function (filter) {
        var obj = this;
        var domainBlacklist = localStorage.getItem(filter.Storage);
        var lastDownload = localStorage.getItem(filter.Storage+"_date");
        if (!lastDownload || Date.parse(CleanDate(lastDownload)) < (7).days().ago() || !domainBlacklist) {
            $.getJSON(filter.Url, function (domains) {
                filter.List = domains;
                localStorage.setItem(filter.Storage+"_date", Date.today());
                localStorage.setItem(filter.Storage, JSON.stringify(filter.List));
                if (!domains) {
                    obj.Log.Warn("No Domains read from "+filter.Url);
                } else {
                    obj.Log.Info(filter.Storage + ": " + domains.length + " Domains read");
                }
            });
        } else {
            obj.Log.Debug("Domains read from local Storage");
            filter.List = JSON.parse(domainBlacklist);
        }
    },
    MarkLinks: function ($ce, filter) {
        if (!filter.List) {
            return;
        }
        var obj = this;

        var mark = function ($el) {
            $el.find('[jsname="WsjYwc"]')
                .not('.wrng'+filter.Storage)
                .addClass('wrng'+filter.Storage)
                .before($('<div style="background-color:'+filter.Back+';color:'+filter.Front+';text-align:center;font-weight:bold;letter-spacing:0.1em;">' + filter.Text + '</div>'));
        };

        var markComment = function ($el) {
            $el.not('.wrng'+filter.Storage)
                .addClass('wrng'+filter.Storage)
                .before($('<div style="background-color:'+filter.Back+';font-size: 8pt;color:'+filter.Front+';text-align:center;font-weight:bold;letter-spacing:0.1em;">' + filter.Text + '</div>'));
        };

        // Hauptbeitrag:
        $ce.find('a.NHphBb').each(function (i, div) {
            filter.List.forEach(function (domain) {
                if (div.href.indexOf(domain + "/") > -1 || div.href.substr(-1, 1) === domain) {
                    mark($(div).closest('c-wiz'));
                }
            });
        });
        $ce.find('.wftCae a').each(function (i, div) {
            filter.List.forEach(function (domain) {
                if (div.href.indexOf(domain + "/") > -1 || div.href.substr(-1, 1) === domain) {
                    mark($(div).closest('c-wiz'));
                }
            });
        });

        // Kommentare:
        $ce.find('a.ot-anchor').each(function (i, div) {
            filter.List.forEach(function (domain) {
                if (div.href.indexOf(domain + "/") > -1 || div.href.substr(-1, 1) === domain) {
                    markComment($(div).closest("li"));
                }
            });
        });
    }
};

