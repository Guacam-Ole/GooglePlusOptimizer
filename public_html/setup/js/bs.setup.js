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
    });
}

function ReplaceDataInTemplate(template, feature) {
    template.find('.featureName').text(feature.Title);
    template.find('.featureDescription').html(feature.Description);
    if (feature.Image !== undefined) {
        template.find('.examplePicture').attr("src", "./wizimg/" + feature.Image);
    } else {
        template.find('.examplePicture').remove();
    }
}

function AddFeatureBlock(featureName) {
    if (featureName === undefined || featureName === null || featureName === "") {
        return;
    }
    var foundFeatures = $.grep(features, function (e) {
        return e.Short === featureName;
    });
    if (foundFeatures.length > 0) {
        var currentFeature = foundFeatures[0];
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
                $('.features').append(divFeature);
            });
        }
    }
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


