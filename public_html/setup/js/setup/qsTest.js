/**
 * Created by Tomato on 04.02.2015.
 */
var imageHost="http://files.oles-cloud.de/optimizer/";
var mouseOffset;
var selectedBlock;
var completeIconList;
var allFolders;

$(document).on('click', '.qsIconCategory', function () {
    $(this).find('.qsIconCategoryIcons').toggle();
    return false;
});

$(document).on('click','.qsClose',function() {
    $(this).closest('.selectedQS').remove();
    return false;
});

$(document).on('click','.qsImage img',function() {
    selectedBlock=$(this).closest('.selectedQS');
    mouseOffset=$(this).offset();
    OpenIconSelection();
    return false;
});



$(document).on('click', '.qsIconCategoryIcons img', function () {
    var bigImage=$(this).attr("src");
    var smallImage=bigImage.replace("/big/","/small/");
    if (selectedBlock!==null && selectedBlock!==undefined) {
        selectedBlock.find('.qsImage img').attr("src",bigImage);
    }

    $('.qsSelectIcon').fadeOut();
    return false;
});

$(document).on('input','.qsAddCircle',function() {
    GetSelectableElements($(this).val());
});







function GetSelectableElements(preselection) {
    var allCircles=JSON.parse(localStorage["QS.AllCircles"]);
    var allElements="<div class='qsDrilldown'>";
    if (preselection.length>0) {
        if (allCircles.Public.indexOf(preselection)>=0) {
           allElements+=drillDownElementTemplate.replace("__ICONCLASS__","qsPublic").replace("__CIRCLE__",allCircles.Public);
        }
        if (allCircles.MyCircles.indexOf(preselection)>=0) {
            allElements+=drillDownElementTemplate.replace("__ICONCLASS__","qsMyCircles").replace("__CIRCLE__",allCircles.MyCircles);
        }
        if (allCircles.ExtendedCircles.indexOf(preselection)>=0) {
            allElements+=drillDownElementTemplate.replace("__ICONCLASS__","qsExtendedCircles").replace("__CIRCLE__",allCircles.ExtendedCircles);
        }
        allCircles.Circles.forEach(function(circle){
            if (circle.indexOf(preselection)>=0) {
                allElements+=drillDownElementTemplate.replace("__ICONCLASS__","qsCircle").replace("__CIRCLE__",circle);
            }
        });
        allCircles.Communities.forEach(function(community){
            if (community.indexOf(preselection)>=0) {
                allElements+=drillDownElementTemplate.replace("__ICONCLASS__","qsCircle").replace("__CIRCLE__",community);
            }
        });
        allElements+="</div>";
    }
}




// google search: https://plus.google.com/complete/search?client=es-sharebox-search&tok=eQeF-jhW-wp1ypw3NXtO0w&authuser=0&xhr=t&q=ne
// https://plus.google.com/complete/search?client=es-sharebox-search&authuser=0&xhr=t&q=ne


function GetAllFolders() {
    return [
        { "file": "accounting" , "text": "Buchhaltung"},
        { "file": "business" , "text": "Business"},
        { "file": "communication" , "text": "Kommunikation"},
        { "file": "construction" , "text": "Auf dem Bau"},
        { "file": "education" , "text": "Schule"},
        { "file": "electrical" , "text": "Elektrische Geräte"},
        { "file": "flags" , "text": "Fahnen"},
        { "file": "gadgets" , "text": "Gadgets"},
        { "file": "jobs" , "text": "Jobs"},
        { "file": "networking" , "text": "Netzwerk"},
        { "file": "transport" , "text": "Transport"}
    ];
}

function GetIconListForFolder(folderData, redirect) {
    var imageHtml="";
    var imageFolder=imageHost+"quickshare/big/"+folderData.file;
    $.get(imageFolder+"/folder.php",function(data) {
       data.forEach(function ( value) {
           if (value.indexOf(".png")>0) {
               imageHtml += singleImageTemplate.replace("__PATH__", imageFolder).replace("__FILE__", value);
           }
       });
        var folderHtml=folderTemplate.replace("__CATEGORY__",folderData.text).replace("__ICONS__",imageHtml);
        completeIconList+=folderHtml;
        redirect();
    });
}



function GetNextFolder(folder) {
    if (allFolders.length === 0) {
        DisplayIcons();
    } else {
        var singleFolder = allFolders.pop();
        GetIconListForFolder(singleFolder, function () {
            GetNextFolder(folder);
        });
    }
}


function DisplayIcons() {
    $('.qsSelectIcon').css('left',mouseOffset.left+120);
    $('.qsSelectIcon').css('top',mouseOffset.top)+20;

    $('.qsSelectIcon').append($(completeIconList));
    $('.qsSelectIcon').fadeIn();
}

function OpenIconSelection() {
    $('.qsSelectIcon').empty();
    if (completeIconList==undefined) {
        allFolders = GetAllFolders();
        if (allFolders.length > 0) {
            completeIconList = "";
            GetNextFolder();
        }
    } else {
        DisplayIcons();
    }
}

var folderTemplate='<div class="qsIconCategory"><span>__CATEGORY__</span><div class="qsIconCategoryIcons">__ICONS__</div></div>';
var singleImageTemplate='<img src="__PATH__/__FILE__"/>';
var drillDownElementTemplate='<div class="qsSelectCircleElement __ICONCLASS_">__CIRCLE__</div>';