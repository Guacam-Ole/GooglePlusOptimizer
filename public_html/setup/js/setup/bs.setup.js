var setup;
var imageHost="http://files.oles-cloud.de/optimizer/";

$(document).ready(function ()
{
    InitMetronic();
    setup = new Setup();
    setup.HandleTagsInput();
});

document.addEventListener("DOMSubtreeModified", function ()
{
    if (setup !== undefined) {
        setup.ReadIndividualSettings();
    }
});

var Setup = function () {

    this.CurrentLang = this.GetLangFromUrl();
    this.Features = [];
    this.Browser = new Browser();
    this.Browser.LoadMessagesForSetup();
    this.LoadContent();
};

Setup.prototype = {
    constructor: Setup,
    GetLangFromUrl: function () {
        var url = location.href;
        var lastSlash = url.lastIndexOf("/");
        var lang = url.substr(lastSlash - 2, 2);
        return lang;
    },
    GetAllFeatures: function () {
        var obj = this;
        $.getJSON("../../_locales/" + this.CurrentLang + "/features.json", function (jsonFeatures) {
            obj.Features = jsonFeatures;
            obj.StartUp();
            obj.ClearContent();
            obj.AddFeatureBlock("welcome");
            obj.ShowTokens();
        });
    },
    LoadContent: function () {
        var obj = this;
        $('#bsContentTop').load("./bs.header.html", function () {
            $('#bsContentNavigation').load("./bs.navigation.html", function () {
                $('#bsFooter').load("./bs.footer.html", function () {
                    obj.GetAllFeatures();
                    obj.FillHeader($('.start').data("title"), $('.start').data("subtitle"), $('.start').data("title"));
                });
            });
        });
    },
    StartUp: function () {
        this.UIActions();
    },
    MenuClick: function (menu) {
        this.FillHeader(menu.data("title"), menu.data("subtitle"), menu.data("title"));
        this.ClearContent();
        // this.DisplayMenuContent();

        this.MenuToggle(menu.find('.arrow'));
        var subMenus = menu.find('.sub-menu li');
        var modules = "";
        if (menu.data("modules") !== undefined) {
            modules += menu.data("modules");
        }
        if (subMenus.length > 0) {
            $.each(subMenus, function (index, value) {
                if ($(value).data("modules") !== undefined) {
                    modules += "," + $(value).data("modules");
                }
            });
        }
        this.DisplayFeatures(modules);
    },
    ShowTokens: function () {
        var obj = this;
        $.each($('.sub-menu li'), function (index, value) {
            if ($(value).data("modules") !== undefined) {
                var anyNotEnabled = false;
                var anyEnabled = false;
                var allModules = $(value).data("modules").split(",");
                $.each(allModules, function (indexModule, valueModule) {
                    var currentFeature = obj.GetFeatureDetails(valueModule);
                    if (currentFeature.TextOnly !== true) {
                        if (localStorage.getItem(valueModule) === true || localStorage.getItem(valueModule) === "true") {
                            anyEnabled = true;
                        } else {
                            anyNotEnabled = true;
                        }
                    }
                });
                if (anyEnabled) {
                    if (anyNotEnabled) {
                        $(value).find('a').append('<span class="badge badge-roundless badge-yellow">teilweise aktiv</span>');
                    } else {
                        $(value).find('a').append('<span class="badge badge-roundless badge-green">aktiv</span>');
                    }
                }

            }
        });
    },
    SubmenuClick: function (sm) {
        this.FillHeader(sm.data("title"), sm.data("subtitle"), sm.closest('.menu').data("title") + "," + sm.data("title"));
        this.ClearContent();
        //  this.DisplayMenuContent();
        var modules = "";
        if (sm.data("modules") !== undefined) {
            modules += sm.data("modules");
        }
        this.DisplayFeatures(modules);
    },
    UIActions: function () {
        var obj = this;
        $(document).on('click', '.menu', function () {
            obj.MenuClick($(this));
            return false;
        });

        $(document).on('click', '.sub-menu a', function () {
            obj.SubmenuClick($(this).closest("li"));
            return false;
        });

        $(document).on('click', '.arrow', function ()
        {
            obj.MenuToggle($(this));
            return false;
        });
        $(document).on('click', '.sendTicketNow', function ()
        {
            obj.AddTicket($('#ticketUser').val(),$('#ticketSubject').val(),$('#ticketContent').val(),$('#ticketType').val());
            $('.addNewTicket').fadeOut();
            return false;
        });
        
        $(document).on('click', '.abortTicket', function ()
        {
            $('.addNewTicket').fadeOut();
            return false;
        });
        
        $(document).on('click', '#showTicketCreation', function ()
        {
            $('.addNewTicket').fadeIn();
            return false;
        });
        
        $(document).on('click', '.ticketLink', function ()
        {
            obj.GetSingleTicket($(this).attr('ticketid'),$(this).closest('div'));
            return false;
        });
        $(document).on('click', '#chkFilterGif', function ()
        {
            if ($($(this)[0]).hasClass("active")) {
                localStorage.setItem("filterGifOnly","false");
            } else {
                localStorage.setItem("filterGifOnly","true");
            }
        });
        
        
        $(document).on('click', '#chkFilterMp4', function ()
        {
            if ($($(this)[0]).hasClass("active")) {
                localStorage.setItem("filterMp4Only","false");
            } else {
                localStorage.setItem("filterMp4Only","true");
            }
        });
        
        $(document).on('click', '#chkWhamText', function ()
        {
            if ($($(this)[0]).hasClass("active")) {
                localStorage.setItem("WHAMWhamText","false");
            } else {
                localStorage.setItem("WHAMWhamText","true");
            }
        });
        
        $(document).on('click', '#chkWhamUrl', function ()
        {
            if ($($(this)[0]).hasClass("active")) {
                localStorage.setItem("WHAMWhamUrl","false");
            } else {
                localStorage.setItem("WHAMWhamUrl","true");
            }
        });
        $(document).on('click', '#chkChristmasText', function ()
        {
            if ($($(this)[0]).hasClass("active")) {
                localStorage.setItem("WHAMChristmasText","false");
            } else {
                localStorage.setItem("WHAMChristmasText","true");
            }
        });
        $(document).on('click', '#chkChristmasUrl', function ()
        {
            if ($($(this)[0]).hasClass("active")) {
                localStorage.setItem("WHAMChristmasUrl","false");
            } else {
                localStorage.setItem("WHAMChristmasUrl","true");
            }
        });
        
        
        
        
        
        $(document).on('click','.thumbnail',function() {
            $(this).closest('.rowColumns').find('.thumbnail').each(function(index,value){
               $(this).removeClass('selected');
            });
            $(this).addClass('selected');
            if ($(this).closest('.parentWeather').length>0) {
                obj.SaveWeather($(this).closest('.singleFeature'),obj);
            }
        });

        $(document).on('click', '.btn.optimizer', function ()
        {
            if ($(this).hasClass("active")) {
                $(this).find('i').removeClass("fa-check").addClass("fa-times");
                var setting=$(this).attr('data-setting');
                if (setting==='weatherEnabled') {
                    obj.SaveWeather($(this).closest('.singleFeature'),obj,true);
                } else {
                   localStorage.setItem(setting,"false");
                }
            } else {
                $(this).find('i').removeClass("fa-times").addClass("fa-check");
                var setting=$(this).attr('data-setting');
                if (setting==='weatherEnabled') {
                    obj.SaveWeather($(this).closest('.singleFeature'),obj,true);
                } else {
                   localStorage.setItem(setting,"true");
                }
            }
        });
        
        $(document).on('change', '.citySelect select', function () { 
            $(this).closest('.weatherSelection').find('.cityId').val($(this).val());
            $(this).closest('.weatherSelection').find('.cityName').val($(this).select()[0].selectedOptions[0].text);
            $(this).fadeOut();
            $('.cityName').fadeIn();
            
            obj.SaveWeather($(this).closest('.singleFeature'),obj);
            
        });
        
        $(document).on('click', '.weatherSelection a', function () {
        try {
            var weather = $(this);
            var weatherInput = $('.cityName');
            var weatherCombo = $('.citySelect select');
            weatherCombo.children().remove();
            var query = "select woeid, country,name, postal from geo.places where text=\"" + weatherInput.val() + "\"";
            var api = 'https://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent(query) + '&format=json';
            console.log("API:" + api);
            var firstEntry=true;
            
            $.getJSON(api, function(data) {
                for (var i in data.query.results.place)
                {
                    var place = data.query.results.place[i];
                    var plz = place.postal;
                    if (plz === null || plz === undefined)
                    {
                        plz = "";
                    } else {
                        plz = plz.content;
                        if (plz === null || plz === undefined)
                        {
                            plz = "";
                        }
                    }
                    var entry = plz + " " + place.name + ", " + place.country.content;
                    var id = place.woeid;
                    if (firstEntry) {
                         $('.weatherSelection').find('.cityId').val(id);
                         $('.weatherSelection').find('.cityName').val(entry);
                        firstEntry=false;
                        obj.SaveWeather($('.singleFeature'),obj);
                    }
                    weatherCombo.append("<option value='" + id + "'>" + entry + "</option>");
                }
                if (!firstEntry) {
                    $('.citySelect').fadeIn();
                    $('.cityName').fadeOut();
                }
            });
            
           
            return false;
        } catch (ex) {
            console.log(ex);
        }
    });
        
        
    },
    SaveWeather:function($parent,obj,isBox) {
        isBox=isBox||false;
        var isChecked=$parent.find('.btn.optimizer').hasClass('active')!==isBox;
        var column=obj.GetColumn($parent);
        var cityName=$parent.find('.weatherSelection .cityName').val();
        var id=$parent.find('.weatherSelection .cityId').val();
        var weather = {Position: column, Id: id, Text: cityName, Enabled:isChecked};
        localStorage.setItem("weatherWidget",JSON.stringify(weather));
    },
    GetColumn:function($parent) {
        var count=0;
        var selectedColumn=0;
        $parent.find('.rowColumns .thumbnail').each(function(index,value) {
            if ($(this).hasClass('selected')) {
                selectedColumn=count;
            }
            count++;
        });
        return selectedColumn;
    },
    SetColumn:function($parent, value) {
        var count=0;
        var selectedColumn=0;
        $parent.parent().find('.rowColumns .thumbnail').each(function() {
            if (count===value) {
                $(this).addClass('selected');
            } else {
                if ($(this).hasClass('selected')) {
                   $(this).removeClass('selected');
                }
            }
            count++;
        });
        return selectedColumn;
    },
    DisplayFeatures: function (features) {
        var obj = this;
        $.each(features.split(","), function (index, feature) {
            obj.AddFeatureBlock(feature);
        });
        window.scrollTo(0, 0);
        return false;
    },
    LoadWeather:function() {
        var obj=this;
        var weather=JSON.parse(localStorage.getItem("weatherWidget"));
        $('.weatherSelection .cityId').val(weather.Id);
        $('.weatherSelection .cityName').val(weather.Text);
        obj.SetColumn($('.weatherSelection'),weather.Position);
        if (weather.Enabled) {
            $('.parentWeather').closest('.singleFeature').find('.btn.optimizer').addClass("active");
            $('.parentWeather').closest('.singleFeature').find('.btn.optimizer').find('i').removeClass("fa-times").addClass("fa-check");
        } else {
            $('.parentWeather').closest('.singleFeature').find('.btn.optimizer').removeClass("active");
            $('.parentWeather').closest('.singleFeature').find('.btn.optimizer').find('i').removeClass("fa-check").addClass("fa-times");
        }
    },
    ReplaceDataInTemplate: function (template, feature) {
        
        var obj=this;
        template.find('.featureName').text(feature.Title);
        template.find('.featureDescription').html(feature.Description);
        template.find('.btn.optimizer').attr('data-setting', feature.Short);
        if (feature.Image !== undefined) {
            template.find('.examplePicture').attr("src", imageHost+"wizard/"+ this.CurrentLang +"/"+ feature.Image);
        } else {
            template.find('.examplePicture').remove();
        }
        if (feature.Cost !== undefined) {
            var costClass = ".cost" + feature.Cost;
            template.find('.costSelector').find(costClass).html('<i class="fa fa-check"></i>');
        } else {
            template.find('.cost').hide();
        }
        template.find('.loadHtml').each(function (index, value) {
            var filename = $(value).data("filename");
            $(value).load(filename + ".html",function() {
                  if (feature.Short==='weatherEnabled') {
                    var $weatherDiv=$('.parentWeather');
                    if ($weatherDiv.length>0 && $weatherDiv.find('.rowColumns').length>0) {
                        obj.LoadWeather();
                       // obj.DisplayWidgetPosition($weatherDiv,obj.GetPosition("Weather"));
                    }
                }
            });
        });
    },
    GetPosition:function(localStorageName) {
        var widget=localStorage.getItem(localStorageName);
        if (widget!==undefined && widget!==null) {
            var json=JSON.parse(widget);
            if (json.length>0) {
                return parseInt(json[0].Position);
            }
        }
        return -1;   // fallback
    },
    GetTickets:function(topic, $target)  {
        var template="<tr><td><a class='ticketLink' ticketid='__ID__'>__NUMBER__</a></td><td>__CREATED__</td><td>__SUBJECT__</td><td>__STATE__</td><td>__CHANGED__</td></tr>";
        
        $.getJSON( "http://ole.enif.uberspace.de/osTicket/jsontickets.php?output=json&id="+topic, function( data ) {
            var output="<table class='ticketTable'><thead><tr><th>Nummer</th><th>Erstellt</th><th>Thema</th><th>Status</th><th>bearbeitet</th></tr></thead>";
            $.each( data, function( key, val ) {
                output+=template.replace("__ID__",val.ticket_id).replace("__NUMBER__",val.number)
                        .replace("__CREATED__",val.created).replace("__SUBJECT__",val.subject)
                        .replace("__STATE__",val.state).replace("__CHANGED__",val.updated);
            });
            output+="</table><div class='ticketDetails'></div>";
            $target.html(output);
        });  
    },
    AddTicket:function(username, subject, content, type) {
        $.getJSON( "http://ole.enif.uberspace.de/osTicket/CreateTicket.php?user="+encodeURIComponent(username)+"&subject="+encodeURIComponent(subject)+"&content="+encodeURIComponent(content)+"&type="+encodeURIComponent(type), function( data ) {
          var $success=JSON.parse(data)  ;
          
        });  
    },
    GetSingleTicket:function(id, $parent) {
        var template="<div class='singleTicketPost'><span class='date'>__DATE__</span><span class='username'>__USER__</span><div class='body'>__BODY__</div></div>";
        $.getJSON( "http://ole.enif.uberspace.de/osTicket/jsonticketsdetails.php?id="+id, function( data ) {
            var output="";
            $.each( data, function( key, val ) {
                output+=template.replace("__USER__",val.poster).replace("__DATE__",val.created).replace("__BODY__",val.body);
            });            
            $parent.find('.ticketDetails').html(output);
            $parent.find('.ticketDetails').toggle();
        });  
    },
    
    GetFeatureDetails: function (featureName) {
        var foundFeatures = $.grep(this.Features, function (e) {
            return e.Short === featureName;
        });
        if (foundFeatures.length > 0) {
            return foundFeatures[0];
        } else {
            return null;
        }
    },
    AddFeatureBlock: function (featureName) {
        var obj = this;
        if (featureName === undefined || featureName === null || featureName === "") {
            return;
        }
        var currentFeature = this.GetFeatureDetails(featureName);

        var divFeature = $("<div></div>");
        divFeature.find('.featureName').text(currentFeature.Title);
        if (currentFeature.TextOnly === true) {
            divFeature.load("bs.custom.html", function () {
                obj.ReplaceDataInTemplate(divFeature, currentFeature);
                $('.features').append(divFeature);
                if (featureName==='bugs') {
                    obj.GetTickets(1,$('.tickets'));
                }
                if (featureName==='featurerequests') {
                    obj.GetTickets(2,$('.featurerequests'));
                }
            });
        } else {
            divFeature.load("bs.feature.html", function () {
                obj.ReplaceDataInTemplate(divFeature, currentFeature);
                if (obj.FeatureEnabled(featureName)) {
                    divFeature.find('.btn.optimizer').addClass("active");
                    divFeature.find('.btn.optimizer').find('i').removeClass("fa-times").addClass("fa-check");
                }
                $('.features').append(divFeature);

                if (featureName === 'hashtag') {
                    if ($('.tokensHashtags').length > 0) {
                        $('.tokensHashtags').val(localStorage.getItem("hashTags"));
                        obj.HashTag($('.tokensHashtags'));
                    }
                }
                
                if (featureName === 'custom') {
                    if ($('.tokensText').length > 0) {
                        $('.tokensText').val(localStorage.getItem("fulltext"));
                        obj.CustomText($('.tokensText'));
                    }
                }
                
                
            });
        }
    },
    CustomText: function ($element) {
        var obj = this;
        $element.tagsInput({
            width: 'auto',
            defaultText: obj.Browser.GetMessageFromSetup('Setup_newFilter'),
            'onAddTag': function ()
            {
                obj.SaveSetting("fulltext", $element.val());
            },
            'onRemoveTag': function ()
            {
                obj.SaveSetting("fulltext", $element.val());
            }
        });
    },
    HashTag: function ($element) {
        var obj = this;
        $element.tagsInput({
            width: 'auto',
            defaultText: obj.Browser.GetMessageFromSetup('Setup_newHashtag'),
            'onAddTag': function () {
                try {
                    var hashTags = $element.val();
                    $element.val("");
                    // Prüfen, ob alle Einträge eine Raute besitzen:
                    var hashTagArray = hashTags.split(',');
                    $.each(hashTagArray, function (i, hashTag)
                    {
                        var tmp;
                        if ($element.val() !== '')
                        {
                            tmp = $element.val() + ",";
                            $element.val(tmp);
                        }
                        hashTag = "#" + hashTag.trim().replace("#", "");
                        tmp = $element.val() + hashTag;
                        $element.val(tmp);
                    });
                    // Speichern der geänderten Werte
                    obj.SaveSetting("hashTags", $element.val());
                } catch (ex) {
                    console.log(ex);
                }
            },
            'onRemoveTag': function ()
            {
                obj.SaveSetting("hashTags", $element.val());
            }
        });
    },
    FeatureEnabled: function (featureName) {
        return localStorage.getItem(featureName) === true || localStorage.getItem(featureName) === "true";
    },
    ClearContent: function () {
        $('.features').empty();
    },
    FillHeader: function (title, subtitle, breadcrumb) {
        $('.page-title').html(title + " <small>" + subtitle + "</small>");
        var crumb = breadcrumb.split(",");

        var breadCrumbHtml = "<li><i class='fa fa-home'></i><a href='index.html'>Home</a><i class='fa fa-angle-right'></i></li>";
        $.each(crumb, function (index, value) {
            breadCrumbHtml += "<li>" + value;
            if (index < crumb.length - 1) {
                breadCrumbHtml += "<i class='fa fa-angle-right'></i>";
            }
            breadCrumbHtml += "</li>";
        });
        $('.page-breadcrumb').html(breadCrumbHtml);
    },
    MenuToggle: function (parent) {
        if (parent.hasClass("open")) {
            parent.closest(".menu").removeClass("active open");
            parent.removeClass("open");
        } else {
            $('.menu').removeClass("active open");
            $('.arrow').removeClass("open");
            parent.closest(".menu").addClass("active open");
            parent.addClass("open");
        }
    },
    ReadIndividualSettings: function () {
        // WHAM:
        this.SetSingleCheck($('#chkWhamText'), "WHAMWhamText");
        this.SetSingleCheck($('#chkWhamUrl'), "WHAMWhamUrl");
        this.SetSingleCheck($('#chkChristmasText'), "WHAMChristmasText");
        this.SetSingleCheck($('#chkChristmasUrl'), "WHAMChristmasUrl");

        // Minimieren:
        this.SetSingleCheck($('#chkFilterGif'), "filterGifOnly");
        this.SetSingleCheck($('#chkFilterMp4'), "filterMp4Only");
    },
    SetSingleCheck: function (button, value) {
        var obj = this;
        if (button !== undefined && button.length === 1) {
            if (obj.FeatureEnabled(value)) {
                button.addClass("active");
                button.find('i').removeClass("fa-times").addClass("fa-check");
            }
        }
    },
    HandleTagsInput: function () {
        var obj = this;
        if (!jQuery().tagsInput)
        {
            return;
        }

        $(document).on('itemAdded', '.tokensHashtags', function () {
            try {
                var hashTags = $('.tokensHashtags').val();
                $('.tokensHashtags').val("");
                // Prüfen, ob alle Einträge eine Raute besitzen:
                var hashTagArray = hashTags.split(',');
                $.each(hashTagArray, function (i, hashTag)
                {
                    var tmp;
                    if ($('.tokensHashtags').val() !== '')
                    {
                        tmp = $('.tokensHashtags').val() + ",";
                        $('.tokensHashtags').val(tmp);
                    }
                    hashTag = "#" + hashTag.trim().replace("#", "");
                    tmp = $('.tokensHashtags').val() + hashTag;
                    $('.tokensHashtags').val(tmp);
                });

                // Speichern der geänderten Werte
                obj.SaveSetting("hashTags", $('.tokensHashtags').val());
            } catch (ex) {
                console.log(ex);
            }
        });
        $(document).on("itemRemoved", '.tokensHashtags', function () {
            obj.SaveSetting("hashTags", $('.tokensHashtags').val());
        });
        $(document).on("itemAdded", ".tokensText", function () {
            obj.SaveSetting("fulltext", $('.tokensText').val());
        });
        $(document).on("itemRemoved", ".tokensText", function () {
            obj.SaveSetting("fulltext", $('.tokensText').val());
        });
    },
    SaveSetting: function (key, value) {
        localStorage.setItem(key, value);
    }
};




function InitMetronic() {
    Metronic.init(); // init metronic core components
    Layout.init(); // init current layout
    QuickSidebar.init(); // init quick sidebar
}
