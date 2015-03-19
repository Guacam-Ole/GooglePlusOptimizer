var gpoBookmarks = function () {
    this.BookmarkPrefix = "Google+Optimizer.Bookmark->";
    this.MaxTeaserLength = 100;
    this.DisplayBookmarks;
    this.BookmarkList;
    this.NewBookmarkList;
    this.BookmarkContent;
    this.SearchString = "notifications/all?displayBookmarks=abersicherdatt";
};

gpoBookmarks.prototype = {
    constructor: gpoBookmarks,
    Init: function () {
        var obj = this;

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

        $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("./setup/css/bookmarks.css") + "' type='text/css' media='screen' />"));
        obj.LoadBookmarkList();
        obj.LoadBookmarkContent();
        obj.PaintFloatingIcon($(document));
        obj.DisplayBookmarksHover();

    },
    Dom: function ($ce) {
       //this.PaintFloatingIcon($ce);
    },
    PaintFloatingIcon:function($ce) {
        var obj = this;
        if ($ce.find('.miniBookmark').length === 0) {
            $(document).on('click', '.miniBookmark', function () {
                obj.ShowBookmarkFloat();
            });

            var bookmarkIcon = "<a class='miniBookmark' > <img src='" + chrome.extension.getURL("./setup/images/icons/small/star_24_dis.png") + "' title='Bookmarks'></a>";
            $ce.find('.Pzc').prepend($(bookmarkIcon));
        }
    },
    CalcBookmarkFloat: function () {
        var maxHeight = $(window).height() - 200;
        var bookmarkCount = $(".allBookmarks").find(".clickOntoBookmark").length;
        var singleHeight = 88;
        var top = $(".miniBookmark").position().top;
        var totalHeight = singleHeight * bookmarkCount + 35;
        var endPos = totalHeight + top;
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
        var $bmDateElement = $source.find('.o-U-s.FI.Rg');
        var $bmSenderPicElement = $source.find(".Uk.wi.hE");
        var $bmSenderNameElement = $source.find(".ob.tv.Ub.Hf").first();
        var $bmImageElement = $source.find(".ar.Mc");
        var $bmLinkElement = $source.find(".ot-anchor");
        var $bmVisibilityElement = $source.find(".d-s.Vt.Hm.dk.Q9");
        var $bmIdElement = $source.parent();
        var $bmContentElements = $source.find('.Ct');

        var id = $bmIdElement.attr("id");
        var date = $bmDateElement.attr("Title");
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
            contentText = contentText.substring(0, obj.MaxTeaserLength + " ");
        }

        var bookmarkContent = {
            Id: origin,
            Created: Date.parse(date),
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
        var storageName = obj.BookmarkPrefix + bookmark.Id;
        chrome.storage.local.remove(storageName, function () {
            chrome.storage.sync.remove(storageName, function () {
                if (displayBookmarks) {
                    obj.DisplayBookmarksHover();
                } else {
                    $parent.remove();
                    obj.CalcBookmarkFloat();
                }
            });
        });
    },
    SaveNewBookmark: function (bookmark) {
        var obj = this;
        var bookmarkObj = {};
        var storageName = obj.BookmarkPrefix + bookmark.Id;
        bookmarkObj[storageName] = JSON.stringify(bookmark);

        // Erst Lokal:
        chrome.storage.local.set(bookmarkObj, function () {
            console.log("Bookmark saved locally");
            bookmark.ContentHtml = null;
            bookmark.IsCloudOnly = true;
            bookmarkObj[storageName] = JSON.stringify(bookmark);
            chrome.storage.sync.set(bookmarkObj, function () {
                console.log("... and up in da cloud");
                obj.DisplayBookmarksHover();
            });
        });
    },
    DisplayBookmarksHover: function () {
        var obj = this;

        var savedBookmarks = [];
        var container = '<div class="QPc y9fV aac BookmarksHover"><div class="showBmBig"><a class="maximizeBookmarks" href="#">Bookmarks maximieren</a></div><div class="allBookmarks">__ALLBOOKMARKS__</div></div>';

        var bookmarkDivTemplate = '<div data-target="__URL__" class="clickOntoBookmark" role="button" tabindex="0"><div class="RemoveBookmarkCross Sgb" rel="button"></div><div class="littleBookmarkImage"><img class="e4a" src="__USERPIC__"/></div><div class="littleBookmarkContent"><span class="bookDate">__DATE__ </span><strong>__USERNAME__</strong></div><div class="littleBookmarkTeaser">__TEASER__</div></div>';
        var bookmarkDivs = '';

        chrome.storage.sync.get(null, function (syncResult) {
            // Erst einmal die cloud-Bookmarks:
            $.each(syncResult, function (key, value) {
                if (key.indexOf(obj.BookmarkPrefix) === 0) {
                    savedBookmarks.push(JSON.parse(value));
                }
            });

            chrome.storage.local.get(null, function (localResult) {
                // Jetzt, wenn vorhanden: Bookmarks, die lokal liegen
                $.each(localResult, function (key, value) {
                    if (key.indexOf(obj.BookmarkPrefix) === 0) {
                        var foundBookmark = $.grep(savedBookmarks, function (e) {
                            return e.Id === JSON.parse(value).Id;
                        });
                        if (foundBookmark.length > 0) {
                            var index = savedBookmarks.indexOf(foundBookmark[0]);
                            savedBookmarks[index] = JSON.parse(value);
                        }
                    }
                });

                obj.NewBookmarkList = savedBookmarks;
                if (savedBookmarks.length > 0) {
                    $('.miniBookmark img').attr("src", chrome.extension.getURL("./setup/images/icons/small/star_24_hot.png"));
                }

                savedBookmarks.sort(function (a, b) {
                    return (new Date(b.Created)) - (new Date(a.Created))
                });
                $.each(savedBookmarks, function (index, value) {


                    var teaser = value.ContentText;
                    if (teaser.indexOf(" ") > 0) {
                        teaser = teaser.substring(0, teaser.lastIndexOf(" "))
                    }

                    bookmarkDivs += bookmarkDivTemplate.replace("__USERPIC__", this.User.Picture).replace("__USERNAME__", this.User.Name).replace("__TEASER__", teaser).replace("__URL__", this.Origin).replace("__DATE__", (new Date(this.Created)).toString("dd.MM.yyyy HH:mm"));
                });
                var completeDiv = container.replace("__ALLBOOKMARKS__", bookmarkDivs);
                $('.BookmarksHover').remove();
                $('.Pzc').append($(completeDiv));
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
                console.log("bookmarks read");
            });
        });
    },
    PaintStars: function () {
        var obj = this;
        $('.lea:not(:has(.addBookmark))').each(function () {
            AddHeadWrapper($(this));
            var id = $(this).closest('.ys').find('.uv.PL a').attr('href');
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
        this.AddNewBookmark(bookmarkButton.closest('[role="article"]'));
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
    LoadBookmarkList: function () {
        var obj = this;
        chrome.runtime.sendMessage({
            Action: "LoadBookmarks"
        }, function (response) {
            obj.BookmarkList = JSON.parse(response.Result) || null;
            if (obj.BookmarkList !== null && obj.BookmarkList.length > 0) {
                $('.miniBookmark img').attr("src", chrome.extension.getURL("./setup/images/icons/small/star_24_hot.png"));
            }
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
    IsBookmarkPage: function () {
        // Für die ALTE Bookmarkseite. Irgendwann rauskicken!
        return window.location.href.indexOf(this.SearchString) >= 0;
    },
    SaveBookmarks: function () {
        var obj = this;
        chrome.runtime.sendMessage({Action: "SaveBookmarks", ParameterValue: JSON.stringify(bookmarkList)});
        chrome.runtime.sendMessage({Action: "SaveBookmarkContents", ParameterValue: JSON.stringify(bookmarkContent)});

        obj.LoadBookmarkList();
        obj.LoadBookmarkContent();
    },
    AddBookmark: function (id, content) {
        var obj = this;
        if ((obj.BookmarkList || null) === null) {
            obj.BookmarkList = [];
            obj.BookmarkContent = [];
        }
        obj.BookmarkList.push(id);
        obj.BookmarkContent.push(content);
        obj.SaveBookmarks();
    },
    RemoveBookmark: function (id) {
        var obj = this;
        var position = $.inArray(id, obj.BookmarkList);
        if (position >= 0) {
            obj.BookmarkList.splice(position, 1);
            obj.BookmarkContent.splice(position, 1);
        }
        obj.SaveBookmarks();
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
    },
    DisplayBookmarks: function () {
        // ALTER SCHEISS! Übergangsweise drin lassen
        if (this.IsBookmarkPage()) {
            var obj = this;
            obj.LoadBookmarkContent();
            // Erst mal alles ausblenden, was Benachrichtigung ist:
            $('.zia.vAa').hide();
            $('.d-s.L5').hide();

            // Dann die einzelnen Bookmarks anfügen:
            if ((obj.BookmarkContent || null) !== null && obj.BookmarkContent.length > 0) {

                $.each(obj.BookmarkContent, function (index, value) {
                    if (value !== null && $('.UPa.hHa.Ic').html().indexOf(value) < 0) {
                        $('.UPa.hHa.Ic').prepend($(value));
                    }
                });

                for (var i = 0; i < 500; i++) {
                    $('.UPa.hHa.Ic').append($("<div><p><br/>&nbsp;</p></div>oink."));
                }
            }
            $('.CF').css("width", "2000px;");
        }
    }
};

