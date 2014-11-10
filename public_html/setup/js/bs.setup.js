$(document).ready(function ()
{
    LoadContent();
});

var currentLang = "de";
var features = [];

function StartUp() {
    InitMetronic();
    UIActions();
}

function MenuClick(menu) {
    FillHeader(menu.data("title"), menu.data("subtitle"), menu.data("title"));
    ClearContent();
    DisplayMenuContent();

    MenuToggle(menu.find('.arrow'));
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
    DisplayFeatures(modules);
}

function ShowTokens() {
    $.each($('.sub-menu li'),function(index,value){
        if ($(value).data("modules") !== undefined) {
            var anyNotEnabled=false;
            var anyEnabled=false;
            var allModules=$(value).data("modules").split(",");
            $.each(allModules,function(indexModule,valueModule){
               var currentFeature = GetFeatureDetails(valueModule);
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
}

function SubmenuClick(sm) {
    FillHeader(sm.data("title"), sm.data("subtitle"), sm.closest('.menu').data("title") + "," + sm.data("title"));
    
    ClearContent();
    DisplayMenuContent();
    var modules="";
    if (sm.data("modules") !== undefined) {
        modules += sm.data("modules");
    }
    DisplayFeatures(modules);
}

function UIActions() {
    $(document).on('click', '.menu', function () {

        MenuClick($(this));
        return false;
    });

    $(document).on('click', '.sub-menu a', function () {
        SubmenuClick($(this).closest("li"));
        return false;
    });


    $(document).on('click', '.arrow', function ()
    {
        MenuToggle($(this));
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
}

function DisplayFeatures(features) {
    $.each(features.split(","), function (index, feature) {
        AddFeatureBlock(feature);
    });
}

function GetAllFeatures() {
    $.getJSON("../../_locales/" + currentLang + "/features.json", function (jsonFeatures) {
        features = jsonFeatures;
        StartUp();
        ClearContent();
        AddFeatureBlock("welcome");
        ShowTokens();
    });
}

function ReplaceDataInTemplate(template, feature) {
    
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
}

function GetFeatureDetails(featureName) {
    var foundFeatures = $.grep(features, function (e) {
        return e.Short === featureName;
    });
    if (foundFeatures.length>0) {
        return foundFeatures[0];
    } else {
        return null;
    }
}

function AddFeatureBlock(featureName) {
    if (featureName === undefined || featureName === null || featureName === "") {
        return;
    }
    var currentFeature = GetFeatureDetails(featureName);
    
    var divFeature = $("<div></div>");
    divFeature.find('.featureName').text(currentFeature.Title);
    if (currentFeature.TextOnly === true) {
        divFeature.load("bs.custom.html", function () {
            ReplaceDataInTemplate(divFeature, currentFeature);
            $('.features').append(divFeature);
        });
    } else {
        divFeature.load("bs.feature.html", function () {
            ReplaceDataInTemplate(divFeature, currentFeature);
            if (FeatureEnabled(featureName)) {
                divFeature.find('.btn.optimizer').addClass("active");
                divFeature.find('.btn.optimizer').find('i').removeClass("fa-times").addClass("fa-check");
            }
            $('.features').append(divFeature);
        });
    }
}

function FeatureEnabled(featureName) {
    return localStorage.getItem(featureName)===true || localStorage.getItem(featureName)==="true";
}

function ClearContent() {
    $('.features').empty();
}

function FillHeader(title, subtitle, breadcrumb) {
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

}

function DisplayMenuContent(parent) {

}

function MenuToggle(parent) {
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


function InitMetronic() {
    Metronic.init(); // init metronic core components
    Layout.init(); // init current layout
    QuickSidebar.init(); // init quick sidebar
}

function LoadContent() {
    // Header:
    $('#bsContentTop').load("./bs.header.html", function () {
        $('#bsContentNavigation').load("./bs.navigation.html", function () {
            GetAllFeatures();
            FillHeader($('.start').data("title"), $('.start').data("subtitle"), $('.start').data("title"));
            
            
        });
    });
}

