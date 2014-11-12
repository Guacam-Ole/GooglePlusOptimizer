$(document).ready(function ()
{
    InitMetronic();
    var setup=new Setup();
});

var Setup=function() {
    this.CurrentLang = "de";
    this.Features = [];
    this.LoadContent();
};

Setup.prototype= {
    constructor:Setup,
    GetAllFeatures:function() {
        var obj=this;
        $.getJSON("../../_locales/" + this.CurrentLang + "/features.json", function (jsonFeatures) {
            obj.Features = jsonFeatures;
            obj.StartUp();
            obj.ClearContent();
            obj.AddFeatureBlock("welcome");
            obj.ShowTokens();
        });    
    },
    LoadContent:function() {
        var obj=this;
        $('#bsContentTop').load("./bs.header.html", function () {
            $('#bsContentNavigation').load("./bs.navigation.html", function () {
                obj.GetAllFeatures();
                obj.FillHeader($('.start').data("title"), $('.start').data("subtitle"), $('.start').data("title"));
            });
        });
    },
    StartUp:function() {       
        this.UIActions();     
    },
    MenuClick:function(menu) {
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
    ShowTokens:function() {
        var obj=this;
        $.each($('.sub-menu li'),function(index,value){
            if ($(value).data("modules") !== undefined) {
                var anyNotEnabled=false;
                var anyEnabled=false;
                var allModules=$(value).data("modules").split(",");
                $.each(allModules,function(indexModule,valueModule){
                   var currentFeature = obj.GetFeatureDetails(valueModule);
                   if (currentFeature.TextOnly!==true) {
                        if (localStorage.getItem(valueModule) === true || localStorage.getItem(valueModule) === "true") {
                            anyEnabled = true;
                        } else {
                            anyNotEnabled = true;
                        }
                    }
                });
                if (anyEnabled) {
                    if (anyNotEnabled) {
                        $(value).find('a').append('<span class="badge badge-roundless badge-yellow">teilweise aktiv</span>')
                    } else {
                        $(value).find('a').append('<span class="badge badge-roundless badge-green">aktiv</span>')
                    }
                }

            }
        });
    },
    SubmenuClick:function(sm) {
        this.FillHeader(sm.data("title"), sm.data("subtitle"), sm.closest('.menu').data("title") + "," + sm.data("title"));
        this.ClearContent();
      //  this.DisplayMenuContent();
        var modules="";
        if (sm.data("modules") !== undefined) {
            modules += sm.data("modules");
        }
        this.DisplayFeatures(modules);
    },
    UIActions:function() {
        var obj=this;
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

        $(document).on('click', '.btn.optimizer', function ()
        {
            if ($(this).hasClass("active")) {
                $(this).find('i').removeClass("fa-check").addClass("fa-times");
            } else {
                $(this).find('i').removeClass("fa-times").addClass("fa-check");
            }
        });
    },
    DisplayFeatures:function(features) {
        var obj=this;
        $.each(features.split(","), function (index, feature) {
            obj.AddFeatureBlock(feature);
        });
        window.scrollTo(0,0);
        return false;
    },
    
    ReplaceDataInTemplate:function(template,feature)  {
        template.find('.featureName').text(feature.Title);
        template.find('.featureDescription').html(feature.Description);
        template.find('.btn.optimizer').attr('data-setting', feature.Short);
        if (feature.Image !== undefined) {
            template.find('.examplePicture').attr("src", "./wizimg/" + feature.Image);
        } else {
            template.find('.examplePicture').remove();
        }
        if (feature.Cost!==undefined) {
            var costClass=".cost"+feature.Cost;
            template.find('.costSelector').find(costClass).html('<i class="fa fa-check"></i>');
        }
        template.find('.loadHtml').each(function(index,value){
            var filename=$(value).data("filename");
            $(value).load(filename+".html");
        });
    },
    GetFeatureDetails:function(featureName) {
        var foundFeatures = $.grep(this.Features, function (e) {
            return e.Short === featureName;
        });
        if (foundFeatures.length>0) {
            return foundFeatures[0];
        } else {
            return null;
        }   
    },
    AddFeatureBlock:function(featureName) {
        var obj=this;
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
            });
        } else {
            divFeature.load("bs.feature.html", function () {
                obj.ReplaceDataInTemplate(divFeature, currentFeature);
                if (obj.FeatureEnabled(featureName)) {
                    divFeature.find('.btn.optimizer').addClass("active");
                    divFeature.find('.btn.optimizer').find('i').removeClass("fa-times").addClass("fa-check");
                }
                $('.features').append(divFeature);
            });
        }
    },
    FeatureEnabled:function(featureName) {
        return localStorage.getItem(featureName)===true || localStorage.getItem(featureName)==="true";
    },
    ClearContent:function() {
        $('.features').empty();    
    },
    FillHeader:function(title, subtitle, breadcrumb) {
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
    MenuToggle:function(parent) {
        if (parent.hasClass("open")) {
            parent.closest(".menu").removeClass("active open");
            parent.removeClass("open");
        } else {
            $('.menu').removeClass("active open");
            $('.arrow').removeClass("open");
            parent.closest(".menu").addClass("active open");
            parent.addClass("open");
        }
    }
};




function InitMetronic() {
    Metronic.init(); // init metronic core components
    Layout.init(); // init current layout
    QuickSidebar.init(); // init quick sidebar
}
