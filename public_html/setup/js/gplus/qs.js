var gpoQuickShare = function (shares) {
    this.Shares = shares;
    this.Circles = [];
    this.AsBookmark = false;
    this.Link;
    this.Step = -1;
};


gpoQuickShare.prototype = {
    constructor: gpoQuickShare,
    Dom: function ($ce) {
        this.PaintIcons($ce);
    },
    Init: function () {
        var obj = this;
        // if (obj.Shares !== null && obj.Shares.length > 0)
        {
            $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("./setup/css/qs.css") + "' type='text/css' media='screen' />"));
        }

        $(document).on('mouseenter', '.quickShareImg', function () {
            var oldName = $(this).prop("src");
            $(this).prop("src", oldName.replace("disabled", "enabled"));
        });
        $(document).on('mouseleave', '.quickShareImg', function () {
            var oldName = $(this).prop("src");
            $(this).prop("src", oldName.replace("enabled", "disabled"));
        });
        $(document).on('click', '.quickShareImg', function () {
            obj.StartClick($(this));
        });
        $(document).on('click', '.UN', function () {
            if (obj.Step > 0) {
                obj.Step = 1;
            }
        });
    },
    GetCircles: function () {
        // Kreise aktualisieren
        var kreise = [];
        $('.xMa.uQa').each(function () {
            var kreisname = $(this).text();
            if (kreise.indexOf(kreisname) < 0) {
                kreise.push(kreisname);
            }
        });
        chrome.runtime.sendMessage({Action: "SaveCircles", ParameterValue: JSON.stringify(kreise)});
    },
    Events: function (changedElements, step) {
        if (this.Step < 1) { // gar kein QS
            return;
        }
        var obj = this;

        // Standard-auswahl beim teilen löschen
        if (obj.Link.closest('[role="article"]').parent() !== null) {
            obj.Link.closest('[role="article"]').parent().find('.g-h-f-m-bd-nb').each(function () {
                // Alle Kreise entfernen
                $(this).click();
            });
            console.log("GPO->QS: Vorhandene Kreise entfernt");
            OpenTimer = setTimeout(function () {
                if (obj.Link.closest('[role="article"]').parent().find('.g-h-f-N-N').length > 0) {
                    obj.Link.closest('[role="article"]').parent().find('.g-h-f-N-N').click();
                    console.log("GPO->QS: Kreisauswahl geöffnet");
                    SelectTime = setTimeout(function () {
                        while (obj.Circles.length > 0) {
                            var lastCircle = obj.Circles.pop();
                            $('.d-A').each(function () {
                                if ($(this).text().indexOf(lastCircle) === 1) {
                                    $(this).click();
                                }
                            });
                        }
                        console.log("GPO->QS: Kreise geklickt");
                        FinalTime = setTimeout(function () {
                            obj.Link.closest('[role="article"]').parent().find('[role="listbox"]').hide();
                            if (obj.AsBookmark) {
                                obj.Link.closest('[role="article"]').parent().find('[guidedhelpid="sharebutton"]').click();
                            } else {
                                obj.Link.closest('[role="article"]').parent().find('[role="textbox"]').focus();
                            }
                            obj.Link.closest('[role="article"]').parent().find('.ut.Ee.Yb.Wf').css({"height": 'auto'});
                            obj.Step = -1;
                            console.log("GPO->QS: Fertig");
                        }, 1000);
                    }, 1000);
                }
            }, 1000);
        }
    },
    PaintIcons: function ($ce) {
        var obj = this;
        if (obj.Shares !== null && obj.Shares.length > 0) {
            $ce.find('[jsname="MxEsy"]:not(:has(.quickShare))>.Qg').each(function () {
                // normale
                var iconHtml = "";

                for (var i in obj.Shares) {
                    var qs = obj.Shares[i];

                    // Übergangsweise: Alte Icons ersetzen:
                    if (qs.Image.indexOf('chrome-extension') >= 0) {
                        var smallPos = qs.Image.indexOf('/small');
                        qs.Image = imageHost + "quickshare/" + qs.Image.substring(smallPos + 7);
                    }

                    iconHtml = iconHtml + '<div><img isBookmark="' + qs.BookMarkMode + '" circles="' + qs.Circles + '" class="quickShareImg" src="' + qs.Image.replace("enabled", "disabled") + '" title="' + qs.Circles + '"/></div>';
                }
                $(this).before('<div class="quickShare">' + iconHtml + '<br/></div><div class="qscl"></div>');
            });

            $ce.find('.yM.bD:not(:has(.quickShare))>.Qg').each(function () {
                // breite
                var iconHtml = "";

                for (var i in obj.Shares) {
                    var qs = obj.Shares[i];
                    iconHtml = iconHtml + '<div><img isBookmark="' + qs.BookMarkMode + '" circles="' + qs.Circles + '" class="quickShareImg" src="' + qs.Image.replace("enabled", "disabled") + '" title="' + qs.Circles + '"/></div>';
                }
                $(this).before('<div class="quickShare">' + iconHtml + '<br/></div><div class="qscl"></div>');
            });
        }
    },
    StartClick: function (container) {
        this.Link = container;
        //container.attr("circles","Hamburg,Nette Leute,Firmen");
        this.Circles = container.attr("circles").split(',');

        this.AsBookmark = JSON.parse(container.attr("isBookmark"));
        this.Link.closest('[role="article"]').find('.Dg.Ut').click();
        this.Step = 1;
    }
};

