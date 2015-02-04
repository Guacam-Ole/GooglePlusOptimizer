/**
 * Created by Tomato on 04.02.2015.
 */
var imageHost="http://files.oles-cloud.de/optimizer/";
var mouseOffset;

$(document).on('click', '.qsIconCategory', function () {
    $(this).find('.qsIconCategoryIcons').toggle();
    return false;
});

$(document).on('click','.qsClose',function() {
    $(this).closest('.selectedQS').remove();
    return false;
});

$(document).on('click','.qsImage img',function() {
    mouseOffset=$(this).offset();
    OpenIconSelection();
    return false;
});



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

var completeIconList;
var allFolders;

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
    $('.qsSelectIcon').css('left',mouseOffset.left);
    $('.qsSelectIcon').css('top',mouseOffset.top);

    $('.qsSelectIcon').append($(completeIconList));
    $('.qsSelectIcon').fadeIn();

}

function OpenIconSelection() {
    $('.qsSelectIcon').empty();
    allFolders = GetAllFolders();
    if (allFolders.length > 0) {
        completeIconList = "";
        GetNextFolder();
    }
}

var folderTemplate='<div class="qsIconCategory"><span>__CATEGORY__</span><div class="qsIconCategoryIcons">__ICONS__</div></div>';
var singleImageTemplate='<img src="__PATH__/__FILE__"/>';