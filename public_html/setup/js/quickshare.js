var allCircles;

function GetAllImages() 
{    
    $.ajaxSetup( { "async": false } );    
    var result=$.getJSON( "../../_locales/de/icons.json");
    $.ajaxSetup( { "async": true } )    ;
    return JSON.parse(result.responseText);
}

function GetAllDirectories() {
    var directories = [];
    var allImages = GetAllImages();
    for (var i in allImages) {
        fileDir = allImages[i].split('/')[0];
        if (directories.indexOf(fileDir) < 0) {
            directories.push(fileDir);
        }
    }
    return directories;
}

function GetImagesFromDirectory(directory) {
    var dirImages = [];
    var allImages = GetAllImages();
    for (var i in allImages) {
        if (allImages[i].indexOf(directory) === 0) {
            dirImages.push(allImages[i]);
        }
    }
    return dirImages;
}

function GetQuickShareInfo() {
    chrome.runtime.sendMessage(
            {
                Action: "LoadCircles"}, function(response) {
        allCircles = response.Result;
        allCircles.sort();
        $('#circleCount').text(allCircles.length);
    }
    );
}

function AddQuickShareRow() {
    var alreadyExistingRows = $('#allShare').find('.iconSelectCategory').length;
    var singleRow = $('<div class="iconSelectCategory imgSelSize" rowId="' + alreadyExistingRows + '"><button type="button" class="removeDD btn btn-default btn-lg"><span class="fa fa-cut"></span></button><a class="QuickShareIconSelect"><img class="mainImage" src="../images/icons/small/unknown.png" title="'+chrome.i18n.getMessage("selectIcon")+'"/></a><div class="category"/><a class="selectCircle">+ '+chrome.i18n.getMessage("selectCircle")+'</a><hr class="clear" /></div>');
    var allDirs = GetAllDirectories();
    allDirs.sort();
    for (var i in allDirs)
    {
        var allImages = GetImagesFromDirectory(allDirs[i]);
        var directoryDiv = $('<div class="categoryHeader imgSelSize"><a class="QuickShareCategorySelect"><img src="../images/icons/small/' + allImages[0] + '" title="' + allDirs[i] + '"/></a> ' + chrome.i18n.getMessage("icons_" + allDirs[i]) + '<hr class="clear" /></div>');

        var details = $('<div class="categoryDetails"/>');
        for (var u in allImages) {
            var singleImage = $('<div class="iconDescription imgSelSize" ><a imageId="' + u + '" class="QuickShareImageSelect"><img src="../images/icons/small/' + allImages[u] + '"/></a></div>');
            details.append(singleImage);
        }
        details.append($('<hr class="clear" />'));
        directoryDiv.append(details);
        singleRow.find('.category').append(directoryDiv);
    }
    singleRow.append($('<div class="inputDD inputDD' + alreadyExistingRows + '"><input type="text" class="form-control typeahead tags" value="Hamburger Sportverein" style="display: none;"/></div>'));
    singleRow.append('<input class="chkBookmark" type="checkbox">'+chrome.i18n.getMessage("BookmarkMode")+'</input> '+chrome.i18n.getMessage("sharedImmediatly")+'<br/><br/>');
    $('#allShare').append(singleRow);

    AddQuickShareEvents();

    $('.inputDD' + alreadyExistingRows).tagsInput
            (
                    {
                        'autocomplete_url': ' ',
                        'autocomplete': {
                            'source': allCircles
                        },
                        width: 'auto',
                        'onAddTag': function()
                        {
                            SaveAllQuickShares();
                        },
                        'onRemoveTag': function()
                        {
                            SaveAllQuickShares();
                        }
                    }
            );
}

function InitQSEvents() {
    $('#closeCirclesExplanation').click(function()
    {
        $('.circlesExplanation').fadeOut();
    });

    $('#displayCirclesExplanation').click(function()
    {
        $('.circlesExplanation').fadeIn();
    });

    $('#recalcCircles').click(function() {
        $('.circlesLoaded').fadeIn();
    });
}

function GetSingleQuickShareData(qsBlock)
{
    if (qsBlock.html() === undefined || qsBlock.html()==="") {
        return null;
    }
    var singleQuickShare = new Object();
    var image = qsBlock.find('.QuickShareIconSelect').first('.mainImage').find('img');
    singleQuickShare.Image = image.prop('src');
    singleQuickShare.Circles = qsBlock.find('.inputDD').val();
    singleQuickShare.BookMarkMode = qsBlock.find('.chkBookmark').prop('checked');

    if (singleQuickShare.Circles.length === 0) {
        return null;
    } else {
        return singleQuickShare;
    }
}

function SaveAllQuickShares()
{
    var allQS = [];
    $('.iconSelectCategory').each(function() {
        var singleQS = GetSingleQuickShareData($(this));
        if (singleQS !== null) {
            allQS.push(singleQS);
        }
    });

    chrome.runtime.sendMessage({Action: "SaveQS", QuickShares: JSON.stringify(allQS)});
}

function LoadAllQuickShares() 
{
    var allQS = [];

    chrome.runtime.sendMessage(
            {
                Action: "LoadQS"
            }, function(response)
    {
        allQS = JSON.parse(response.Result);
        $('#allShare').find('.iconSelectCategory').empty();
        for (var i in allQS)
        {
            var oneItem = allQS[i];
            AddQuickShareRow();
            var qsBlock = $('#allShare').find('.iconSelectCategory').last();
            var image = qsBlock.find('.QuickShareIconSelect').first('.mainImage').find('img');
            image.prop("src", oneItem.Image);
            qsBlock.find('.chkBookmark').prop('checked', oneItem.BookMarkMode);
            qsBlock.find('.inputDD').importTags(oneItem.Circles);
        }
    });
}

function AddQuickShareEvents()
{
    $('.QuickShareIconSelect').off('click');
    $('.QuickShareCategorySelect').off('click');
    $('.QuickShareImageSelect').off('click');
    $('.removeDD').off('click');
    $('.selectCircle').off('click');
    $('.chkBookmark').off('click');


    $('.selectCircle').click(function() {
        $('.listAllCircles').fadeToggle();
        if ($('.listAllCircles').is(":visible")) {
            $('.listAllCircles').children().empty();
            for (var i in allCircles) {
                var singleCircleText = $('<div ><a class="selectSingleCircle">' + allCircles[i] + '</a></div>');
                $('.listAllCircles').append(singleCircleText);
            }
            $('.listAllCircles').appendTo($(this));
        }
        $('.selectSingleCircle').off('click');
        $('.selectSingleCircle').click(function() {
            var circleName = $(this).text();
            console.log(circleName + " clicked");
            var input = $(this).closest('.iconSelectCategory').find('.inputDD');
            input.addTag(circleName);

            $('.listAllCircles').fadeOut();
            return false;
        });
    });
    $('.chkBookmark').click(function() {
        SaveAllQuickShares();
    });

    $('.QuickShareIconSelect').click(function()
    {
        $(this).parent().find('.categoryHeader').fadeToggle();
    });
    $('.QuickShareCategorySelect').click(function()
    {
        $(this).parent().find('.categoryDetails').fadeToggle();
    });

    $('.QuickShareImageSelect').click(function()
    {
        var imageId = $(this).attr("imageId");
        var imageName = $(this).find('img').attr("src");

        $(this).closest('.iconSelectCategory').attr("imageId", imageId);
        $(this).closest('.iconSelectCategory').find(".mainImage").attr("src", imageName);

        $(this).closest('.iconSelectCategory').find('.categoryHeader').hide();
        $(this).closest('.iconSelectCategory').find('.categoryDetails').hide();
        SaveAllQuickShares();
        return false;
    });

    $('.removeDD').click(function() {
        $(this).closest('.iconSelectCategory').empty();
        SaveAllQuickShares();
        return false;
    });
}