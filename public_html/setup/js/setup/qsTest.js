/**
 * Created by Tomato on 04.02.2015.
 */
var imageHost = "http://files.oles-cloud.de/optimizer/";
var mouseOffset;
var selectedBlock;
var completeIconList;
var allFolders;



$(document).ready(function(){
    LoadQs();
});




/*
$('.selectedQS').click(function(event) {
        if(!$(event.target).closest('.qsDrilldown').length && !$(event.target).closest('.qsSelectIcon').length) {
            if ($('.qsDrilldown') !== undefined) {
                $('.qsDrilldown').remove();
            }
            if ($('.qsSelectIcon') !== undefined) {
                $('.qsSelectIcon').hide();
            }
        }
});*/

$(document).on('click', '.qsIconCategory', function () {
    $(this).find('.qsIconCategoryIcons').toggle();
    return false;
});

$(document).on('click', '.qsClose', function () {
    $(this).closest('.selectedQS').remove();
    return false;
});

$(document).on('click', '.qsImage img', function () {

    if ($('.qsSelectIcon').is(":hidden") )  {
        selectedBlock = $(this).closest('.selectedQS');
        mouseOffset = $(this).offset();
        var oldPic = $(this).attr("src");
        $(this).attr("src", "../images/icons/gearbox.gif");
        OpenIconSelection(oldPic);
    } else {
        $('.qsSelectIcon').hide();
    }
    return false;
});


$(document).on('click', '.qsIconCategoryIcons img', function () {
    var bigImage = $(this).attr("src");
    var smallImage = bigImage.replace("/big/", "/small/");
    if (selectedBlock !== null && selectedBlock !== undefined) {
        selectedBlock.find('.qsImage img').attr("src", bigImage);
    }

    $('.qsSelectIcon').fadeOut();
    return false;
});

$(document).on('input', '.qsAddCircle', function () {
    GetSelectableElements($(this), $(this).val().toLowerCase());
});

$(document).on('click', '.qsAddCircle', function () {
    if ($('.qsDrilldown').length>0) {
        $('.qsDrilldown').remove();
    } else {
        GetSelectableElements($(this), $(this).val().toLowerCase());
    }
});

function GetForbiddenElements(parent) {
    var forbiddenValues = [];
    parent.find('.qsCircleText').each(function (index, value) {
        forbiddenValues.push($(value).text().toLowerCase());
    });
    return forbiddenValues;
}

function IsForbidden(forbiddenElements, element) {
    return $.inArray(element, forbiddenElements)>-1;
}

function AddElementToQs(element) {
    var elementName=element.val();
}

function RemoveElementToQs(element) {
    var elementName=element.val();
}

/**
 * @return {string}
 */
function GetSingleQsCircles(qsSetting) {
    var retHtml="";
    var allCircles = GetAllCircles();
    qsSetting.Circles.split(",").forEach(function(value) {
        // Farben und Icons:
        var color="blue";
        var type="qsCirclePerson";
        if (value.toLowerCase()==allCircles.Public.toLowerCase()) {
            color="green";
            type="qsCircleWorld";
        } else if (value.toLowerCase()==allCircles.MyCircles.toLowerCase()) {
            color="green";
            type="qsCircleSingle";
        } else if (value.toLowerCase()==allCircles.ExtendedCircles.toLowerCase()) {
            color="green";
            type="qsCircleMany";
        } else {
            if (allCircles.Circles!==undefined) {
                allCircles.Circles.forEach(function ( circleValue) {
                    if (circleValue.toLowerCase()===value.toLowerCase()) {
                        type="qsCircleSingle";
                    }
                });
            }
            if (allCircles.Communities!==undefined) {
                allCircles.Communities.forEach(function ( communityValue) {
                    if (communityValue.toLowerCase()===value.toLowerCase()) {
                        type="qsCommunity";
                    }
                });
            }
        }

        // Basteln des Tags
        retHtml+=circleTemplate.replace("__CLASS__",type).replace("__COLOR__",color).replace("__NAME__",value);
    });
    return retHtml;
}

function LoadSingleQs(qsSetting) {

    var image=qsSetting.Image;
    if (image.indexOf("chrome-extension")>=0) {
        image=imageHost+"quickshare/small/communication/warnings.png";
    }

    var html=qsTemplate.replace("__IMAGE__",image.replace("/small/","/big/"));
    return html.replace("__CIRCLES__",GetSingleQsCircles(qsSetting));
}


function LoadQs() {
    var lsqs=localStorage['QuickShares'];
    if (lsqs!==undefined) {
        var qs=JSON.parse(lsqs);

        qs.forEach(function(value) {
            $('.existingQS').append(LoadSingleQs(value));
        });

    }
}

    function GetAllCircles() {
        var allCircles = JSON.parse(localStorage["QS.AllCircles"]);
        allCircles.Public = allCircles.Public || obj.Browser.GetMessageFromSetup('Circles_Public');
        allCircles.MyCircles = allCircles.MyCircles || obj.Browser.GetMessageFromSetup('Circles_Private');
        allCircles.ExtendedCircles = allCircles.ExtendedCircles || obj.Browser.GetMessageFromSetup('Circles_Extended');

        return allCircles;
    }

function GetSelectableElements(element, preselection) {
    if ($('.qsDrilldown').length>0) {
        $('.qsDrilldown').remove();
    }
    var forbiddenElements=GetForbiddenElements(element.closest('.qsCircles'));
    var allCircles=GetAllCircles();
    var allElements = "<div class='qsDrilldown' style='left: " + element.offset().left + "px; top:" + (element.offset().top + 23) + "px;'>";

    if (preselection === undefined || allCircles.Public.toLowerCase().indexOf(preselection) >= 0) {
        if (!IsForbidden(forbiddenElements,allCircles.Public.toLowerCase())) {
            allElements += drillDownElementTemplate.replace("__ICONCLASS__", "qsPublic").replace("__CIRCLE__", allCircles.Public);
        }
    }
    if (preselection === undefined || allCircles.MyCircles.toLowerCase().indexOf(preselection) >= 0) {
        if (!IsForbidden(forbiddenElements,allCircles.MyCircles.toLowerCase())) {
            allElements += drillDownElementTemplate.replace("__ICONCLASS__", "qsMyCircles").replace("__CIRCLE__", allCircles.MyCircles);
        }
    }
    if (preselection === undefined || allCircles.ExtendedCircles.toLowerCase().indexOf(preselection) >= 0) {
        if (!IsForbidden(forbiddenElements,allCircles.ExtendedCircles.toLowerCase())) {
            allElements += drillDownElementTemplate.replace("__ICONCLASS__", "qsExtendedCircles").replace("__CIRCLE__", allCircles.ExtendedCircles);
        }
    }
    if (allCircles.Circles !== undefined) {
        allCircles.Circles.sort();
        allCircles.Circles.forEach(function (circle) {
            if (preselection === undefined || circle.toLowerCase().indexOf(preselection) >= 0) {
                if (!IsForbidden(forbiddenElements,circle.toLowerCase())) {
                    allElements += drillDownElementTemplate.replace("__ICONCLASS__", "qsSingleCircle").replace("__CIRCLE__", circle).replace("__TITLE__", circle);
                }
            }
        });
    }
    if (allCircles.Communities !== undefined) {
        allCircles.Communities.sort();
        allCircles.Communities.forEach(function (community) {
            if (preselection === undefined || community.toLowerCase().indexOf(preselection) >= 0) {
                if (!IsForbidden(forbiddenElements,community.toLowerCase())) {
                    allElements += drillDownElementTemplate.replace("__ICONCLASS__", "qsCommunity").replace("__CIRCLE__", community).replace("__TITLE__", community);
                }
            }
        });
    }
    allElements += "</div>";
    var objElements = $(allElements);
    if (objElements.find('.qsSingleCircle').length > 0 && (objElements.find('.qsPublic').length > 0 || objElements.find('.qsMyCircles'.length > 0) || objElements.find('.qsExtendedCircles').length > 0)) {
        objElements.find('.qsSingleCircle').first().closest('.qsSelectCircleElement').before("<div class='grayLine'></div>");
    }

    if (objElements.find('.qsCommunity').length > 0 && (objElements.find('.qsSingleCircle').length > 0 || objElements.find('.qsPublic').length > 0 || objElements.find('.qsMyCircles'.length > 0) || objElements.find('.qsExtendedCircles').length > 0)) {
        objElements.find('.qsCommunity').first().closest('.qsSelectCircleElement').before("<div class='grayLine'></div>");
    }


    element.after(objElements);

    // }
}


// google search: https://plus.google.com/complete/search?client=es-sharebox-search&tok=eQeF-jhW-wp1ypw3NXtO0w&authuser=0&xhr=t&q=ne
// https://plus.google.com/complete/search?client=es-sharebox-search&authuser=0&xhr=t&q=ne


function GetAllFolders() {
    return [
        {"file": "accounting", "text": "Buchhaltung"},
        {"file": "business", "text": "Business"},
        {"file": "communication", "text": "Kommunikation"},
        {"file": "construction", "text": "Auf dem Bau"},
        {"file": "education", "text": "Schule"},
        {"file": "electrical", "text": "Elektrische Geräte"},
        {"file": "flags", "text": "Fahnen"},
        {"file": "gadgets", "text": "Gadgets"},
        {"file": "jobs", "text": "Jobs"},
        {"file": "networking", "text": "Netzwerk"},
        {"file": "transport", "text": "Transport"}
    ];
}

function GetIconListForFolder(folderData, redirect) {
    var imageHtml = "";
    var imageFolder = imageHost + "quickshare/big/" + folderData.file;
    $.get(imageFolder + "/folder.php", function (data) {
        data.forEach(function (value) {
            if (value.indexOf(".png") > 0) {
                imageHtml += singleImageTemplate.replace("__PATH__", imageFolder).replace("__FILE__", value);
            }
        });
        var folderHtml = folderTemplate.replace("__CATEGORY__", folderData.text).replace("__ICONS__", imageHtml);
        completeIconList += folderHtml;
        redirect();
    });
}


function GetNextFolder(oldPic, folder) {
    if (allFolders.length === 0) {
        DisplayIcons(oldPic);
    } else {
        var singleFolder = allFolders.pop();
        GetIconListForFolder(singleFolder, function () {
            GetNextFolder(oldPic,folder);
        });
    }
}


function DisplayIcons(oldPic) {
    $('.qsSelectIcon').css('left', mouseOffset.left + 120);
    $('.qsSelectIcon').css('top', mouseOffset.top) + 20;

    $('.qsSelectIcon').append($(completeIconList));
    $('.qsSelectIcon').fadeIn();
    selectedBlock.find('.qsImage img').attr('src',oldPic);
}

function OpenIconSelection(oldPic) {
    $('.qsSelectIcon').empty();
    if (completeIconList == undefined) {
        allFolders = GetAllFolders();
        if (allFolders.length > 0) {
            completeIconList = "";
            GetNextFolder(oldPic);
        }
    } else {
        DisplayIcons(oldPic);
    }
}

var folderTemplate = '<div class="qsIconCategory"><span>__CATEGORY__</span><div class="qsIconCategoryIcons">__ICONS__</div></div>';
var singleImageTemplate = '<img src="__PATH__/__FILE__"/>';
var drillDownElementTemplate = '<div class="qsSelectCircleElement"><span class="__ICONCLASS__"></span><span title="__TITLE__" class="inner">__CIRCLE__</span></div>';

var qsTemplate='<div class="selectedQS"><div class="qsImage"><img src="__IMAGE__"/></div><div class="qsRight">__CIRCLES__<input type="text" placeholder="+ Kreis oder Person hinzufügen" class="qsAddCircle"></div></div>';
var circleTemplate='<span class="qsCircle __COLOR__"><span class="innerCircle"><span class="__CLASS__"></span><span class="qsCircleText">__NAME__</span><span class="qsCircleRemove"></span></span></span>';
