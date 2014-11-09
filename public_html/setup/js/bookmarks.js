/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var bookmarkPrefix="Google+Optimizer.Bookmark->";
var maxTeaserLength=100;
var displayBookmarks;
var bookmarkList;
var newBookmarkList;
var bookmarkContent;
var searchString = "notifications/all?displayBookmarks=abersicherdatt";

$(document).ready(function()
{
    if (document.location.href.indexOf("bookmarks.html") > 0) {
        LoadBookmarksForDisplay();
    }
    
    $(document).on("click",".clickOntoBookmark",function() {
        var target=$(this).data("target");
        window.location.href=target;
        return false;
    });
    
});

function InitBookmarks() {
    if (displayBookmarks === true) {
        $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("./setup/css/bookmarks.css") + "' type='text/css' media='screen' />"));
        LoadBookmarkList();
        LoadBookmarkContent();

        $(document).on('click', '.addBookmark', function()
        {
            ClickBookmark($(this));
        });
        
        $(document).on('click', '.RemoveBookmarkCross', function()
        {
            var id=$(this).parent().data("target");
            var bookmark={Id:id};
            RemoveNewBookmark(bookmark, false, $(this).parent());
           
            return false;
        });
        
        
        if ($('.miniBookmark').length === 0)
        {
            $(document).on('click', '.miniBookmark', function()
            {
                ShowBookmarkFloat();
            }); 

            var bookmarkIcon = "<a class='miniBookmark' > <img src='" + chrome.extension.getURL("./setup/images/icons/small/star_24_dis.png") + "' title='Bookmarks'></a>";
            $('.Pzc').prepend($(bookmarkIcon));
        }
        DisplayBookmarksHover();
    }
}

function CalcBookmarkFloat() {
    var maxHeight=$(window).height()-200;
    var bookmarkCount=$(".allBookmarks").find(".clickOntoBookmark").length;
    var singleHeight=88;
    var top=$(".miniBookmark").position().top;
    var totalHeight=singleHeight*bookmarkCount+35;
    var endPos=totalHeight+top;
    if (endPos>maxHeight) {
        totalHeight=maxHeight;
    }
    $(".BookmarksHover").height(totalHeight);
}

function ShowBookmarkFloat() {
    $(".BookmarksHover").toggle();
    CalcBookmarkFloat();
    
    return false;
}


function AddNewBookmark($source) {
    var $bmDateElement=$source.find('.o-U-s.FI.Rg');
    var $bmSenderPicElement=$source.find(".Uk.wi.hE");
    var $bmSenderNameElement=$source.find(".ob.tv.Ub.Hf").first();
    var $bmImageElement=$source.find(".ar.Mc");
    var $bmLinkElement=$source.find(".ot-anchor");
    var $bmVisibilityElement=$source.find(".d-s.Vt.Hm.dk.Q9");
    var $bmIdElement=$source.parent();
    var $bmContentElements=$source.find('.Ct');
    
    var id=$bmIdElement.attr("id");
    var date=$bmDateElement.attr("Title");
    var origin=$bmDateElement.attr("href");
    var userPic=$bmSenderPicElement.attr("src");
    var userName=$bmSenderNameElement.text();
    var userUrl=$bmSenderNameElement.attr("href");
    var image=$bmImageElement.attr("src");
    var url=$bmLinkElement.attr("href");
    var urlTitle=$bmLinkElement.text();
    var visibility=$bmVisibilityElement.text();
    var contentHtml='';
    var contentText='';
    $.each($bmContentElements,function(index, value){
        contentHtml+=$(value).html()+"<br/>";
        contentText+=$(value).text()+"\n";
    });
    
    if (contentText.length>maxTeaserLength) {
        contentText=contentText.substring(0,maxTeaserLength+" ");
    }
    
    var bookmarkContent= {
        Id:origin,
        Created:Date.parse(date),
        Origin:origin,
        User: {
            Picture:userPic,
            Name:userName,
            Url:userUrl
        },
        Link: {
            Picture: image,
            Url: url,
            Title: urlTitle
        },
        Visibility: visibility,
        ContentText:contentText,
        ContentHtml:contentHtml,
        IsCloudOnly:false
    };
    var isNewBookmark;
    if (ContainsNewBookmark(bookmarkContent)) {
        RemoveNewBookmark(bookmarkContent);
        isNewBookmark=false;
    } else {
        SaveNewBookmark(bookmarkContent);
        isNewBookmark=true;
    }
    
    var iconUrl;
    if (isNewBookmark)
    {
        iconUrl = chrome.extension.getURL("./setup/images/icons/small/star_24_hot.png");
    } else {
        iconUrl = chrome.extension.getURL("./setup/images/icons/small/star_24_dis.png");
    }
    $source.find('.addBookmark').attr('src', iconUrl);
}

function RemoveNewBookmark(bookmark, displayBookmarks, $parent) {
    if (displayBookmarks===undefined) {
        displayBookmarks=true;
    }
    var storageName=bookmarkPrefix+bookmark.Id;
    chrome.storage.local.remove(storageName, function(){
        chrome.storage.sync.remove(storageName,function() {
            if (displayBookmarks) {
                DisplayBookmarksHover();
            } else {
                $parent.remove();
                CalcBookmarkFloat();
            }
        });
    });
}

function SaveNewBookmark(bookmark) {
    var bookmarkObj={}; 
    var storageName=bookmarkPrefix+bookmark.Id;
    bookmarkObj[storageName]=JSON.stringify(bookmark);
    
    // Erst Lokal:
    chrome.storage.local.set(bookmarkObj,function() {
        console.log("Bookmark saved locally");
        bookmark.ContentHtml=null;
        bookmark.IsCloudOnly=true;
        bookmarkObj[storageName]=JSON.stringify(bookmark);
        chrome.storage.sync.set(bookmarkObj,function() {
            console.log("... and up in da cloud");
            DisplayBookmarksHover();
        });
    });
}

     
function DisplayBookmarksHover() {
    var savedBookmarks=[];
    var container='<div class="QPc y9fV aac BookmarksHover"><div class="showBmBig"><a class="maximizeBookmarks" href="#">Bookmarks maximieren</a></div><div class="allBookmarks">__ALLBOOKMARKS__</div></div>';
    
    var bookmarkDivTemplate='<div data-target="__URL__" class="clickOntoBookmark" role="button" tabindex="0"><div class="RemoveBookmarkCross Sgb" rel="button"></div><div class="littleBookmarkImage"><img class="e4a" src="__USERPIC__"/></div><div class="littleBookmarkContent"><span class="bookDate">__DATE__ </span><strong>__USERNAME__</strong></div><div class="littleBookmarkTeaser">__TEASER__</div></div>';
    var bookmarkDivs='';
    
    chrome.storage.sync.get(null,function(syncResult) {
        // Erst einmal die cloud-Bookmarks:
        $.each(syncResult,function(key,value) {
            if (key.indexOf(bookmarkPrefix)===0) {
                savedBookmarks.push(JSON.parse(value));
            }
        });
        
        chrome.storage.local.get(null,function(localResult){
            // Jetzt, wenn vorhanden: Bookmarks, die lokal liegen
            $.each(localResult,function(key,value) {
                if (key.indexOf(bookmarkPrefix)===0) {
                    var foundBookmark = $.grep(savedBookmarks, function(e){ return e.Id === JSON.parse(value).Id; });
                    if (foundBookmark.length>0) {
                        var index=savedBookmarks.indexOf(foundBookmark[0]);
                        savedBookmarks[index]=JSON.parse(value);
                    }
                }
            });
            newBookmarkList=savedBookmarks;
            if (savedBookmarks.length>0) {
                $('.miniBookmark img').attr("src", chrome.extension.getURL("./setup/images/icons/small/star_24_hot.png"));
            }
            
            savedBookmarks.sort(function(a,b) { return (new Date(b.Created)) - (new Date(a.Created)) } );
            $.each(savedBookmarks,function(index, value) {
                
                
                var teaser=value.ContentText;
                if (teaser.indexOf(" ")>0) {
                   teaser=teaser.substring(0,teaser.lastIndexOf(" "))
                }
                
                bookmarkDivs+=bookmarkDivTemplate.replace("__USERPIC__",this.User.Picture).replace("__USERNAME__",this.User.Name).replace("__TEASER__",teaser).replace("__URL__",this.Origin).replace("__DATE__",(new Date(this.Created)).toString("dd.MM.yyyy HH:mm"));
            });
            var completeDiv=container.replace("__ALLBOOKMARKS__",bookmarkDivs);
            $('.BookmarksHover').remove();
            $('.Pzc').append($(completeDiv));
            $('.BookmarksHover').bind('mousewheel DOMMouseScroll', function(e){
                var scrollTo = null;
                if (e.type == 'mousewheel') {
                    scrollTo = (e.originalEvent.wheelDelta * -1);
                }
                else if (e.type == 'DOMMouseScroll') {
                    scrollTo = 40 * e.originalEvent.detail;
                }
                if (scrollTo) {
                    e.preventDefault();
                    $(this).scrollTop(scrollTo + $(this).scrollTop());
                }
            });
            PaintStars();
           
            console.log("bookmarks read");
        });
    });
}

function PaintStars() {
     $('.lea:not(:has(.addBookmark))').each(function()      //$('h3.zi:not(:has(.addBookmark))').each(function()
            {
                AddHeadWrapper($(this));
                var id = $(this).closest('.ys').find('.uv.PL a').attr('href');
                var iconHtml = "";
                var iconUrl = chrome.extension.getURL("./setup/images/icons/small/star_24_dis.png");
                if (ContainsBookmark(id)) {
                    iconUrl = chrome.extension.getURL("./setup/images/icons/small/star_24_hot.png");
                }
                iconHtml = iconHtml + '<img class="addBookmark" src="' + iconUrl + '" title="Bookmark"/>';

                $(this).find('.InfoUsrTop').append(iconHtml);
            });
}

function ClickBookmark(bookmarkButton)
{
    AddNewBookmark(bookmarkButton.closest('[role="article"]')) ;
    return;
}

function DisplayBookMarkIcons()
{
    if (displayBookmarks)
    {
        DisplayBookmarks();
        
    }
}

function ContainsBookmark(id) {
    if (newBookmarkList!==undefined && newBookmarkList!==null && newBookmarkList.length>0) {
        var foundBookmark = $.grep(newBookmarkList, function(e){ return e.Id===id; });
        return foundBookmark.length>0;
    } 
}

function ContainsNewBookmark(bookmark) {
    return ContainsBookmark(bookmark.Id);
}


function LoadBookmarksForDisplay() {
    chrome.runtime.sendMessage(
            {
                Action: "LoadBookmarks"
            }, function(response)
    {
        bookmarkList = JSON.parse(response.Result) || null;
        chrome.runtime.sendMessage(
                {
                    Action: "LoadBookmarkContents"
                }, function(response)
        {
            bookmarkContent = JSON.parse(response.Result) || null;
            DisplayBookmarksInside();

        });
    });
}

function LoadBookmarkList()
{
    chrome.runtime.sendMessage(
            {
                Action: "LoadBookmarks"
            }, function(response)
    {
        bookmarkList = JSON.parse(response.Result) || null;
        if (bookmarkList !== null && bookmarkList.length > 0) {
            $('.miniBookmark img').attr("src", chrome.extension.getURL("./setup/images/icons/small/star_24_hot.png"));
        }
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
    return window.location.href.indexOf(searchString) >= 0;
}

function SaveBookmarks() {
    chrome.runtime.sendMessage({Action: "SaveBookmarks", ParameterValue: JSON.stringify(bookmarkList)});
    chrome.runtime.sendMessage({Action: "SaveBookmarkContents", ParameterValue: JSON.stringify(bookmarkContent)});

    LoadBookmarkList();
    LoadBookmarkContent();
}

function AddBookmark(id, content) {


    if ((bookmarkList || null) === null) {
        bookmarkList = [];
        bookmarkContent = [];
    }

    bookmarkList.push(id);
    bookmarkContent.push(content);
    SaveBookmarks();
}

function RemoveBookmark(id) {
    var position = $.inArray(id, bookmarkList);
    if (position >= 0) {
        bookmarkList.splice(position, 1);
        bookmarkContent.splice(position, 1);
    }
    SaveBookmarks();
}

function DisplayBookmarksInside() {
    

    if ((bookmarkContent || null) !== null && bookmarkContent.length > 0) {

        $.each(bookmarkContent, function(index, value)
        {
            if (value !== null) {
                $('.displayBookMarks').prepend($(value));
            }
        });
    }
}

function DisplayBookmarks() {
    if (IsBookmarkPage())
    {
        //$("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("./setup/css/bookmarkdisplay.css") + "' type='text/css' media='screen' />"));
        
        LoadBookmarkContent();
        // Erst mal alles ausblenden, was Benachrichtigung ist:
        $('.zia.vAa').hide();
        $('.d-s.L5').hide();

        // Dann die einzelnen Bookmarks anfügen:
        if ((bookmarkContent || null) !== null && bookmarkContent.length > 0) {

            $.each(bookmarkContent, function(index, value)
            {
                if (value !== null && $('.UPa.hHa.Ic').html().indexOf(value) < 0) {
                    $('.UPa.hHa.Ic').prepend($(value));
                }
            });

            for (var i = 0; i < 500; i++) {
                $('.UPa.hHa.Ic').append($("<div><p><br/>&nbsp;</p></div>oink."));
            }
        }
        $('.CF').css( "width", "2000px;" );
    }
}