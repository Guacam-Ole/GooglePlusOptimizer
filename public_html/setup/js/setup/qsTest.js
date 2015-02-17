/**
 * Created by Tomato on 04.02.2015.
 */
var imageHost = "https://files.oles-cloud.de/optimizer/";
var mouseOffset;
var selectedBlock;
var completeIconList;
var allFolders;
this.Browser = new Browser();
this.Browser.LoadMessagesForSetup();

$(document).ready(function(){
    LoadQs();
});

$(document).on('click', '.qsIconCategory', function () {
    $(this).find('.qsIconCategoryIcons').toggle();
    return false;
});

$(document).on('click', '.addNewQs a', function () {
    var lsqs=localStorage['QuickShares'];
    if (lsqs!==undefined) {
        var qs = JSON.parse(lsqs);
    } else {
        qs=[];
    }
    var singleQsElement={};
    singleQsElement.Image=imageHost+"quickshare/small/communication/warnings.png";
    singleQsElement.Circles="";
    qs.push (singleQsElement);
    localStorage.setItem("QuickShares",JSON.stringify(qs));
    LoadQs();

    return false;
});



$(document).on('click', '.qsClose', function () {
    DeleteQs($(this));
    $(this).closest('.selectedQS').remove();

    return false;
});

$(document).on('click', '.qsSelectCircleElement .inner', function () {
    AddElementToQs($(this));
    return false;
});

$(document).on('click', '.qsCircleRemove', function () {
    RemoveElementFromQs($(this));
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
    var id=selectedBlock.closest('.selectedQS').find('.qsId').val();
    var bigImage = $(this).attr("src");
    var smallImage = bigImage.replace("/big/", "/small/");
    if (selectedBlock !== null && selectedBlock !== undefined) {
        selectedBlock.find('.qsImage img').attr("src", bigImage);
    }

    var lsqs=localStorage['QuickShares'];
    var qs=JSON.parse(lsqs);
    qs[id].Image=smallImage;
    localStorage.setItem('QuickShares',JSON.stringify(qs));

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

function AddElementToQs( element) {
    var wrapper=element.closest('.selectedQS');
    var id=wrapper.find('.qsId').val();
    var lsqs=localStorage['QuickShares'];
    var qs=JSON.parse(lsqs);
    var elementName=element.text();
    qs[id].Circles+=(","+elementName);
    localStorage["QuickShares"]=JSON.stringify(qs);
    ReloadQs(element.closest(wrapper));
}

function DeleteQs(element) {
    var id=parseInt(element.closest('.selectedQS').find('.qsId').val());
    for (var i=1000; i>id; i--) {
        var idElement= element.closest('.existingQS').find('.qsId[value="'+i+'"] ');
        if (idElement.length>0) {
            idElement.val(i-1);
        }
    }
    var lsqs=localStorage['QuickShares'];
    var qs=JSON.parse(lsqs);
    qs.splice(id, 1);
    localStorage.setItem("QuickShares",JSON.stringify(qs));
}

function RemoveElementFromQs(element) {
    var wrapper=element.closest('.selectedQS');
    var id=wrapper.find('.qsId').val();
    var lsqs = localStorage['QuickShares'];
    var qs = JSON.parse(lsqs);
    var elementName = element.parent().find('.qsCircleText').text();
    if (qs[id].Circles.indexOf(elementName) === 0) {
        qs[id].Circles=qs[id].Circles.replace(elementName + ",", "");
    } else {
        qs[id].Circles=qs[id].Circles.replace("," + elementName, "");
    }
    localStorage["QuickShares"]=JSON.stringify(qs);
    ReloadQs(element.closest(wrapper));
}

/**
 * @return {string}
 */
function GetSingleQsCircles(qsSetting) {
    var retHtml="";
    var allCircles = GetAllCircles();
    qsSetting.Circles.split(",").forEach(function(value) {
        if (value.length>0) {

            // Farben und Icons:
            var color = "blue";
            var type = "qsCirclePerson";
            if (value.toLowerCase() == allCircles.Public.toLowerCase()) {
                color = "green";
                type = "qsCircleWorld";
            } else if (value.toLowerCase() == allCircles.MyCircles.toLowerCase()) {
                color = "green";
                type = "qsCircleSingle";
            } else if (value.toLowerCase() == allCircles.ExtendedCircles.toLowerCase()) {
                color = "green";
                type = "qsCircleMany";
            } else {
                if (allCircles.Circles !== undefined) {
                    allCircles.Circles.forEach(function (circleValue) {
                        if (circleValue.toLowerCase() === value.toLowerCase()) {
                            type = "qsCircleSingle";
                        }
                    });
                }
                if (allCircles.Communities !== undefined) {
                    allCircles.Communities.forEach(function (communityValue) {
                        if (communityValue.toLowerCase() === value.toLowerCase()) {
                            type = "qsCircleCommunity";
                        }
                    });
                }
            }

            // Basteln des Tags
            retHtml += circleTemplate.replace("__CLASS__", type).replace("__COLOR__", color).replace("__NAME__", value);
        }
    });
    return retHtml;
}

function ReloadQs(parent) {
    var id=parent.find('.qsId').val();
    var lsqs=localStorage['QuickShares'];
    var qs=JSON.parse(lsqs);
    var setting=qs[id];

    parent.html($(LoadSingleQs(setting,id)).html());
}

function LoadSingleQs(qsSetting, counter) {
    var image=qsSetting.Image;
    if (image.indexOf("chrome-extension")>=0) {
        image=imageHost+"quickshare/small/communication/warnings.png";
    }
    var title=qsSetting.Title;
    if (title===undefined) {
        title="QuickShare "+(parseInt(counter)+1);
    }

    var html=qsTemplate.replace("__IMAGE__",image.replace("/small/","/big/")).replace("__INDEX__",counter).replace("__TITLE__",title);
    return html.replace("__CIRCLES__",GetSingleQsCircles(qsSetting));
}

function LoadQs() {
    var counter=0;
    var lsqs=localStorage['QuickShares'];
    if (lsqs!==undefined) {
        var qs=JSON.parse(lsqs);
        $('.existingQS').empty();
        qs.forEach(function(value) {
            $('.existingQS').append(LoadSingleQs(value, counter));
            counter++;
        });
    }
}

function GetAllCircles() {
    var obj=this;
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
}

function GetAllFolders() {
    return JSON.parse(this.Browser.GetMessageFromSetup('QuickShare_Folders'));
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

var qsTemplate='<div class="selectedQS"><input type="hidden" class="qsId" value="__INDEX__" > <div class="qsImage"><img src="__IMAGE__"/></div><div class="qsRight"><div class="qsClose">&nbsp;</div><div class="qsText">__TITLE__</div><div class="qsCircles">__CIRCLES__<input type="text" placeholder="+ Kreis oder Person hinzufügen" class="qsAddCircle"></div></div></div>';
var circleTemplate='<span class="qsCircle __COLOR__"><span class="innerCircle"><span class="__CLASS__"></span><span class="qsCircleText">__NAME__</span><span class="qsCircleRemove"></span></span></span>';
