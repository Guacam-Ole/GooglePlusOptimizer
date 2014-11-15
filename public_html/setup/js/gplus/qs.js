var gpoQuickShare=function(shares) {
    this.Shares=shares;
    this.Circles=[];
    this.AsBookmark=false;
    this.Link;
    this.Step=-1;
};

gpoQuickShare.prototype= {
    constructor: gpoQuickShare,
    Dom:function() {
        this.PaintIcons();
    },
    Init:function() {
        var obj=this;
        if (obj.Shares !== null && obj.Shares.length > 0)
        {
            $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("./setup/css/qs.css") + "' type='text/css' media='screen' />"));
        }
                
        $(document).on('mouseenter', '.quickShareImg', function()
        {
            var oldName = $(this).prop("src");
            $(this).prop("src", oldName.replace("disabled", "enabled"));
        });
        $(document).on('mouseleave', '.quickShareImg', function()
        {
            var oldName = $(this).prop("src");
            $(this).prop("src", oldName.replace("enabled", "disabled"));
        });
        $(document).on('click', '.quickShareImg', function()
        {
            obj.StartClick($(this));
        });
        $(document).on('click', '.UN', function()
        {
            if (obj.Step > 0) {
                obj.Step = 1;
            }
        });
    },
    GetCircles:function(){
        // Kreise aktualisieren
        var kreise = [];
        $('.xMa.uQa').each(function() {
            var kreisname = $(this).text();
            if (kreise.indexOf(kreisname) < 0) {
                kreise.push(kreisname);
            }
        });
        chrome.runtime.sendMessage({Action: "SaveCircles", ParameterValue: JSON.stringify(kreise)});
    },
    Events:function(){
        var obj=this;
        switch (obj.Step)
        {
            case 0:
                obj.Step++;
                break;
            case 1:
                // Standard-auswahl beim teilen löschen
                if (obj.Link.closest('[role="article"]').parent() !== null)
                {
                    obj.Link.closest('[role="article"]').parent().find('.g-h-f-m-bd-nb').each(function()
                    {
                        $(this).click();
                    });

                    obj.Step++;
                }
                break;
            case 2:
                // Kreisauswahl öffnen
                if (obj.Link.closest('[role="article"]').parent() !== null)
                {
                    if (obj.Link.closest('[role="article"]').parent().find('.g-h-f-N-N').length > 0)
                    {
                        obj.Link.closest('[role="article"]').parent().find('.g-h-f-N-N').click();
                        obj.Step++;
                    }
                }
                break;
            case 3:
                // Kreise auswählen
                if (obj.Link.closest('[role="article"]').parent() !== null)
                {
                    var lastCircle = obj.Circles.pop();
                    $('.d-A').each(function()
                    {
                        if ($(this).text().indexOf(lastCircle) === 1) {
                            $(this).click();

                        }
                    });

                    if (obj.Circles.length === 0) {
                        obj.Step++;
                    }
                }
                break;
            case 4:
                // Alle Kreise ausgewählt, Letzte Schritte
                obj.Link.closest('[role="article"]').parent().find('[role="listbox"]').hide();
                if (obj.AsBookmark) {
                    obj.Link.closest('[role="article"]').parent().find('[guidedhelpid="sharebutton"]').click();
                } else {
                    obj.Link.closest('[role="article"]').parent().find('[role="textbox"]').focus();
                }
                obj.Link.closest('[role="article"]').parent().find('.ut.Ee.Yb.Wf').css({"height": 'auto'});
                obj.Step = -1;
                break;
        }
    },
    PaintIcons:function() {
        var obj=this;
        if (obj.Shares!==null && obj.Shares.length > 0) {
            $('[jsname="MxEsy"]:not(:has(.quickShare))>.Qg').each(function()
            {
                // normale
                var iconHtml = "";

                for (var i in obj.Shares) {
                    var qs = obj.Shares[i];
                    iconHtml = iconHtml + '<div><img isBookmark="' + qs.BookMarkMode + '" circles="' + qs.Circles + '" class="quickShareImg" src="' + qs.Image.replace("enabled", "disabled") + '" title="' + qs.Circles + '"/></div>';
                }
                $(this).before('<div class="quickShare">' + iconHtml + '<br/></div><div class="qscl"></div>');
            });

            $('.yM.bD:not(:has(.quickShare))>.Qg').each(function()
            {
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
    StartClick:function(container) {
        this.Link = container;
        this.Circles= container.attr("circles").split(',');
        this.AsBookmark= JSON.parse(container.attr("isBookmark"));
        this.Link.closest('[role="article"]').find('.Dg.Ut').click();
        this.Step=1;
    }
};

