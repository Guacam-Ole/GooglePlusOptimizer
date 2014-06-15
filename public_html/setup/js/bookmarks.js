/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var displayBookmarks;
var bookmarkList;
var bookmarkContent;
var searchString = "displayBookmarks=abersicherdatt";

function InitBookmarks() {
    if (displayBookmarks==true) {
        $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("./setup/css/bookmarks.css") + "' type='text/css' media='screen' />"));
        LoadBookmarkList();

        $(document).on('click', '.addBookmark', function()
        {
            ClickBookmark($(this));
        });
        
        if ($('.miniBookmark').length===0) 
        {
            var bookmarkIcon="<a class='miniBookmark' href='https://plus.google.com/u/0/notifications/all?displayBookmarks=abersicherdatt'> <img src='"+ chrome.extension.getURL("./setup/images/icons/quickshare/disabled/stock/star_48.png")+"' title='Bookmarks'></a>";
            $('.gb_Sa').before($(bookmarkIcon));
        }
    }
}


function ClickBookmark(bookmarkButton)
{
    var id = bookmarkButton.closest('.ys').find('.uv.PL a').attr('href');
    var content = bookmarkButton.closest("[jsmodel='XNmfOc']").clone();
      content.find('.quickShare').remove();
      content.find('.Qg').remove();
      content.find('.Tt.bj').remove();

    var iconUrl;
    if (ContainsBookmark(id))
    {
        RemoveBookmark(id);
        if (IsBookmarkPage()) {
            bookmarkButton.closest("[jsmodel='XNmfOc']").hide();
        }
        iconUrl = chrome.extension.getURL("./setup/images/icons/quickshare/disabled/stock/star_48.png");        
    } else {
        AddBookmark(id,content[0].outerHTML.replace('/disabled/stock/star','/enabled/stock/star'));
        iconUrl = chrome.extension.getURL("./setup/images/icons/quickshare/enabled/stock/star_48.png");
    }
    
    bookmarkButton.attr('src', iconUrl);

}

function DisplayBookMarkIcons()
{
    if (displayBookmarks)
            //if (bookmarkList !== null && quickShares.length > 0)
            {
                DisplayBookmarks();
                $('h3.zi:not(:has(.addBookmark))').each(function()
                {
                    var id = $(this).closest('.ys').find('.uv.PL a').attr('href');
                    var iconHtml = "";
                    var iconUrl = chrome.extension.getURL("./setup/images/icons/quickshare/disabled/stock/star_48.png");
                    if (ContainsBookmark(id)) {
                        iconUrl = chrome.extension.getURL("./setup/images/icons/quickshare/enabled/stock/star_48.png");
                    }
                    iconHtml = iconHtml + '<img class="addBookmark" src="' + iconUrl + '" title="Bookmark"/>';

                    $(this).append(iconHtml);
                });
            }
}



/* Prüfen, ob Bookmark schon gespeichert */
function ContainsBookmark(id) {
    if (bookmarkList !== undefined && bookmarkList !== null && bookmarkList.length > 0) {
        return bookmarkList.indexOf(id) >= 0;
    } else {
        return false;
    }
}

function LoadBookmarkList()
{
    chrome.runtime.sendMessage(
            {
                Action: "LoadBookmarks"
            }, function(response)
    {
        bookmarkList = JSON.parse(response.Result) || null;

    });
}

function LoadBookmarkContent()
{
    chrome.runtime.sendMessage(
            {
                Action: "LoadBookmarkContents"
            }, function(response)
    {
        bookmarkContent = JSON.parse(response.Result) || null;

    });
}

function IsBookmarkPage() {
    return window.location.search.indexOf(searchString) >= 0;
}

function SaveBookmarks() {
    chrome.runtime.sendMessage({Action: "SaveBookmarks", ParameterValue: JSON.stringify(bookmarkList)});
    chrome.runtime.sendMessage({Action: "SaveBookmarkContents", ParameterValue: JSON.stringify(bookmarkContent)});

    LoadBookmarkList();
    LoadBookmarkContent();
}

function AddBookmark(id, content) {
    LoadBookmarkList();
    LoadBookmarkContent();

    if ((bookmarkList || null) === null) {
        bookmarkList = [];
        bookmarkContent = [];
    }

    bookmarkList.push(id);
    bookmarkContent.push(content);
    SaveBookmarks();
}

function RemoveBookmark(id) {
    LoadBookmarkList();
    LoadBookmarkContent();

    var position = $.inArray(id, bookmarkList);
    if (position >= 0) {
        bookmarkList.splice(position, 1);
        bookmarkContent.splice(position, 1);
    }
    SaveBookmarks();
}

function DisplayBookmarks() {

    if (IsBookmarkPage())
    {
        LoadBookmarkContent();
        // Erst mal alles ausblenden, was Benachrichtigung ist:
        $('.zia.vAa').hide();
        $('.d-s.L5').hide();
        
        // Dann die einzelnen Bookmarks anfügen:

        if ((bookmarkContent || null) !== null && bookmarkContent.length > 0) {

            $.each(bookmarkContent, function(index, value)
            {
                if (value!==null && $('.UPa.hHa.Ic').html().indexOf(value)<0) {
                    $('.UPa.hHa.Ic').prepend($(value));
                }
                //$('.CF.he').prepend($(value));
            });

            for (var i = 0; i < 500; i++) {
                $('.UPa.hHa.Ic').append($("<div><p><br/>&nbsp;</p></div>oink."));
            }
        }
    }
}