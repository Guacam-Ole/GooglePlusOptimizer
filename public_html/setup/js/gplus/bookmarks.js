var gpoBookmarks = function (Log) {
    this.BookmarkPrefix = "Google+Optimizer.Bookmark->";
    this.MaxTeaserLength = 120;
    this.DisplayBookmarks;
    this.BookmarkList;
    this.NewBookmarkList;
    this.BookmarkContent;
    this.StillLoading;
    this.WaitCount=0;
    this.Log=Log;
};

gpoBookmarks.prototype = {
    constructor: gpoBookmarks,
    Init: function () {
        var obj = this;
        obj.GetBookmarksFromStorage(function() {obj.ContinueLoading();});
        $(document).on("click", ".clickOntoBookmark", function () {
            var target = $(this).data("target");
            window.location.href = target;
            return false;
        });
        $(document).on('click', '.addBookmark', function () {
            obj.ClickBookmark($(this));
        });
        $(document).on('click', '.RemoveBookmarkCross', function () {
            var id = $(this).parent().data("target");
            var bookmark = {Id: id};
            obj.RemoveNewBookmark(bookmark, false, $(this).parent());
            return false;
        });
        $(document).on('click', '.miniBookmark', function () {
            obj.ShowBookmarkFloat();
        });

        $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("./setup/css/bookmarks.css") + "' type='text/css' media='screen' />"));


    },
    ContinueLoading:function() {
        var obj=this;
        //obj.LoadBookmarkList();
        obj.LoadBookmarkContent();
        obj.PaintFloatingIcon($(document));
        obj.DisplayBookmarksHover();
    },
    WaitBeforePaint:function($ce) {
        var obj=this;
        obj.WaitCount++;
        window.setTimeout(function() {
            if (obj.NewBookmarkList===undefined || obj.StillLoading===true) {
                obj.WaitBeforePaint($ce);
            } else {
                if (obj.WaitCount!==0) {
                    obj.PaintStars();
                    obj.WaitCount = 0;
                }
            }
        },1000);
    },
    Dom: function ($ce) {
        var obj=this;
        if (obj.NewBookmarkList===undefined || obj.StillLoading===true) {
            obj.WaitBeforePaint($ce);
        } else {
            obj.PaintStars();
        }
     //  this.PaintFloatingIcon($ce);
    },
    PaintFloatingIcon:function($ce) {
        var obj = this;

        if ($ce.find('.miniBookmark').length === 0) {


            var bookmarkIcon='<a class="M9kDrd miniBookmark"><div class="Hj0nzc"><img src="' + chrome.extension.getURL("./setup/images/icons/small/star_24_dis.png") + '" title="Bookmarks"></div>'
            +'<div class="CjySve">Bookmarks</div></a>';

            //var bookmarkIcon = "<a class='miniBookmark' > <img src='" + chrome.extension.getURL("./setup/images/icons/small/star_24_dis.png") + "' title='Bookmarks'></a>";
                $ce.find('.L1NA8d').append($(bookmarkIcon));
        }
        if (obj.NewBookmarkList.length > 0) {
            $('.miniBookmark img').attr("src", chrome.extension.getURL("./setup/images/icons/small/star_24_hot.png"));
        } else {
            $('.miniBookmark img').attr("src", chrome.extension.getURL("./setup/images/icons/small/star_24_dis.png"));
        }
    },
    CalcBookmarkFloat: function () {
        var maxHeight = $(window).height() - 200;
        var bookmarkCount = $(".allBookmarks").find(".clickOntoBookmark").length;
        var singleHeight = 110;
        var top = $(".miniBookmark").position().top;
        var totalHeight = singleHeight * bookmarkCount +20;
        var endPos = totalHeight; // + top;
        if (endPos > maxHeight) {
            totalHeight = maxHeight;
        }
        $(".BookmarksHover").height(totalHeight);
    },
    ShowBookmarkFloat: function () {
        $(".BookmarksHover").toggle();
        this.CalcBookmarkFloat();
        return false;
    },
    AddNewBookmark: function ($source) {
        var obj = this;

        var $bmDateElement = $source.find('.qXj2He');   // TODO: Derzeit leider kein Datum, sondern "vor xxx Minuten" und so
        var $bmSenderPicElement = $source.find(".URgs7");
        var $bmSenderNameElement = $source.find(".m3JvWd").first();
        var $bmImageElement = $source.find(".JZUAbb");
        var $bmLinkElement = $source.find(".ot-anchor");
        var $bmVisibilityElement = $source.find(".UTObDb");
        var $bmIdElement = $source.parent();
        var $bmContentElements = $source.find('[jsname="EjRJtf"]'); // collection
        if ($bmContentElements.length==0) {
            $bmContentElements = $source.find('.ELUvyf'); // Normaler Beitrag
        }
        var id =$bmIdElement.data("iid");


        var origin = $bmDateElement.attr("href");
        var userPic = $bmSenderPicElement.attr("src");
        var userName = $bmSenderNameElement.text();
        var userUrl = $bmSenderNameElement.attr("href");
        var image = $bmImageElement.attr("src");
        var url = $bmLinkElement.attr("href");
        var urlTitle = $bmLinkElement.text();
        var visibility = $bmVisibilityElement.text();
        var contentHtml = '';
        var contentText = '';
        $.each($bmContentElements, function (index, value) {
            contentHtml += $(value).html() + "<br/>";
            contentText += $(value).text() + "\n";
        });

        if (contentText.length > obj.MaxTeaserLength) {
            contentText = contentText.substring(0, obj.MaxTeaserLength) + "...";
        }


        var date=Date.now();

        var bookmarkContent = {
            Id: origin,
            Created: date,
            Origin: origin,
            User: {
                Picture: userPic,
                Name: userName,
                Url: userUrl
            },
            Link: {
                Picture: image,
                Url: url,
                Title: urlTitle
            },
            Visibility: visibility,
            ContentText: contentText,
            ContentHtml: contentHtml,
            IsCloudOnly: false
        };
        var isNewBookmark;
        if (obj.ContainsNewBookmark(bookmarkContent)) {
            obj.RemoveNewBookmark(bookmarkContent);
            isNewBookmark = false;
        } else {
            obj.SaveNewBookmark(bookmarkContent);
            isNewBookmark = true;
        }


        var iconUrl;
        if (isNewBookmark) {
            iconUrl = chrome.extension.getURL("./setup/images/icons/small/star_24_hot.png");
        } else {
            iconUrl = chrome.extension.getURL("./setup/images/icons/small/star_24_dis.png");
        }

        $source.find('.addBookmark').attr('src', iconUrl);
    },
    RemoveNewBookmark: function (bookmark, displayBookmarks, $parent) {
        var obj = this;
        if (displayBookmarks === undefined) {
            displayBookmarks = true;
        }
        Log.Info("Bookmark "+bookmark.Id+" removed");
        var storageName = obj.BookmarkPrefix + bookmark.Id;
        chrome.storage.local.remove(storageName, function () {
            chrome.storage.sync.remove(storageName, function () {

                    obj.GetBookmarksFromStorage(function() {
                        if (displayBookmarks) {
                            obj.DisplayBookmarksHover();
                        } else {
                            $parent.remove();
                            obj.CalcBookmarkFloat();
                        }
                    });  // reload Bookmarks
            });
        });
    },
    SaveNewBookmark: function (bookmark) {
        var obj = this;
        var bookmarkObj = {};
        var storageName = obj.BookmarkPrefix + bookmark.Id;
        bookmarkObj[storageName] = JSON.stringify(bookmark);

        Log.Info("Bookmark "+bookmark.Id+" added");
        // Erst Lokal:
        chrome.storage.local.set(bookmarkObj, function () {
            Log.Debug("Bookmark saved locally");
            bookmark.ContentHtml = null;
            bookmark.IsCloudOnly = true;
            bookmarkObj[storageName] = JSON.stringify(bookmark);
            chrome.storage.sync.set(bookmarkObj, function () {
                Log.Debug("... and up in da cloud");
                obj.GetBookmarksFromStorage(function() {
                    obj.DisplayBookmarksHover();
                });  // reload Bookmarks
            });
        });
    },
    GetBookmarksFromStorage:function(target) {
        var obj=this;
        obj.StillLoading=true;
        obj.NewBookmarkList=[];
        chrome.storage.sync.get(null, function (syncResult) {
            // Erst einmal die cloud-Bookmarks:
            $.each(syncResult, function (key, value) {
                if (key.indexOf(obj.BookmarkPrefix) === 0) {
                    obj.NewBookmarkList.push(JSON.parse(value));
                }
            });

            chrome.storage.local.get(null, function (localResult) {
                // Jetzt, wenn vorhanden: Bookmarks, die lokal liegen
                $.each(localResult, function (key, value) {
                    if (key.indexOf(obj.BookmarkPrefix) === 0) {
                        var foundBookmark = $.grep(obj.NewBookmarkList, function (e) {
                            return e.Id === JSON.parse(value).Id;
                        });
                        if (foundBookmark.length > 0) {
                            var index = obj.NewBookmarkList.indexOf(foundBookmark[0]);
                            obj.NewBookmarkList[index] = JSON.parse(value);
                        }
                    }
                });
                obj.StillLoading=false;
                Log.Debug("Read Bookmarks");
                if (target) {
                    target();
                }
                if (obj.NewBookmarkList.length > 0) {
                    $('.miniBookmark img').attr("src", chrome.extension.getURL("./setup/images/icons/small/star_24_hot.png"));
                } else {
                    $('.miniBookmark img').attr("src", chrome.extension.getURL("./setup/images/icons/small/star_24_dis.png"));
                }
            });
        });
    },
    DisplayBookmarksHover: function () {
        var obj = this;

        var savedBookmarks = obj.NewBookmarkList;
        var container = '<div class="BookmarksHover"><div class="allBookmarks">__ALLBOOKMARKS__</div></div>';

        var bookmarkDivTemplate = '<div data-target="__URL__" class="clickOntoBookmark" role="button" tabindex="0"><div class="RemoveBookmarkCross" rel="button"></div><div class="littleBookmarkImage"><img class="e4a" src="__USERPIC__"/></div><div class="littleBookmarkContent"><span class="bookDate">__DATE__ </span><strong>__USERNAME__</strong></div><div class="littleBookmarkTeaser">__TEASER__</div></div>';
        var bookmarkDivs = '';

        savedBookmarks.sort(function (a, b) {
            return (new Date(b.Created)) - (new Date(a.Created))
        });
        $.each(savedBookmarks, function (index, value) {
            var teaser = value.ContentText;
           // if (teaser.indexOf(" ") > 0) {
                teaser = teaser.trim();
            //}

            bookmarkDivs += bookmarkDivTemplate.replace("__USERPIC__", this.User.Picture).replace("__USERNAME__", this.User.Name).replace("__TEASER__", teaser).replace("__URL__", this.Origin).replace("__DATE__", (new Date(this.Created)).toString("dd.MM.yyyy HH:mm"));
        });
        var completeDiv = container.replace("__ALLBOOKMARKS__", bookmarkDivs);
        $('.BookmarksHover').remove();

            $('body').append($(completeDiv));
            $('.BookmarksHover').css("position","fixed");
            $('.BookmarksHover').css("z-index","700");
            $('.BookmarksHover').css("top","70px");
            $('.BookmarksHover').css("left","420px");

        $('.BookmarksHover').bind('mousewheel DOMMouseScroll', function (e) {
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
        obj.PaintStars();
        Log.Debug("bookmarks read");
    },
    PaintStars: function () {
        var obj = this;

            $('.dzuq1e:not(:has(.addBookmark))').each(function () {
                AddHeadWrapper($(this));
                var id = $(this).closest('.dzuq1e').find('.qXj2He').attr('href');


                var iconHtml = "";
                var iconUrl = chrome.extension.getURL("./setup/images/icons/small/star_24_dis.png");
                if (obj.ContainsBookmark(id)) {
                    iconUrl = chrome.extension.getURL("./setup/images/icons/small/star_24_hot.png");
                }
                iconHtml = iconHtml + '<img class="addBookmark" src="' + iconUrl + '" title="Bookmark"/>';

                $(this).find('.InfoUsrTop').append(iconHtml);
            });

    },
    ClickBookmark: function (bookmarkButton) {
        this.AddNewBookmark(bookmarkButton.closest('[jsname="WsjYwc"]'));
        return;
    },
    ContainsBookmark: function (id) {
        var obj = this;

        if (obj.NewBookmarkList !== undefined && obj.NewBookmarkList !== null && obj.NewBookmarkList.length > 0) {
            var foundBookmark = $.grep(obj.NewBookmarkList, function (e) {
                return e.Id === id;
            });
            return foundBookmark.length > 0;
        }
    },
    ContainsNewBookmark: function (bookmark) {
        return this.ContainsBookmark(bookmark.Id);
    },
    LoadBookmarksForDisplay: function () {
        var obj = this;
        chrome.runtime.sendMessage({
            Action: "LoadBookmarks"
        }, function (response) {
            obj.BookmarkList = JSON.parse(response.Result) || null;
            chrome.runtime.sendMessage({
                Action: "LoadBookmarkContents"
            }, function (response) {
                obj.BookmarkContent = JSON.parse(response.Result) || null;
                obj.DisplayBookmarksInside();
            });
        });
    },

    LoadBookmarkContent: function () {
        var obj = this;
        chrome.runtime.sendMessage({
            Action: "LoadBookmarkContents"
        }, function (response) {
            obj.BookmarkContent = JSON.parse(response.Result) || null;
        });
    },

    SaveBookmarks: function () {
        var obj = this;
        chrome.runtime.sendMessage({Action: "SaveBookmarks", ParameterValue: JSON.stringify(bookmarkList)});
        chrome.runtime.sendMessage({Action: "SaveBookmarkContents", ParameterValue: JSON.stringify(bookmarkContent)});

        obj.LoadBookmarkList();
        obj.LoadBookmarkContent();
    },

    DisplayBookmarksInside: function () {
        var obj = this;
        if ((obj.BookmarkContent || null) !== null && obj.B.bookmarkContent.length > 0) {
            $.each(obj.BookmarkContent, function (index, value) {
                if (value !== null) {
                    $('.displayBookMarks').prepend($(value));
                }
            });
        }
    }
};

