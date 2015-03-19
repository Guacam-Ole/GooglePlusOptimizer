/**
 * Created by Tomato on 18.02.2015.
  */
var setupQs;


$(document).ready(function () {
    setupQs=new SetupQuickshare();
});



var SetupQuickshare = function () {
    this.CurrentLang = this.GetLangFromUrl();
    this.Browser = new Browser();
    this.Browser.LoadMessagesForSetup();

    this.MouseOffset=undefined;
    this.SelectedBlock=undefined;
    this.CompleteIconList=undefined;
    this.AllFolders=undefined;
    this.Events();
    this.Templates={};
    this.Templates.Folder = '<div class="qsIconCategory"><span>__CATEGORY__</span><div class="qsIconCategoryIcons">__ICONS__</div></div>';
    this.Templates.SingleImage = '<img src="__PATH__/__FILE__"/>';
    this.Templates.DrillDownElement = '<div class="qsSelectCircleElement"><span class="__ICONCLASS__"></span><span title="__TITLE__" class="inner">__CIRCLE__</span></div>';
    this.Templates.Qs='<div class="selectedQS"><input type="hidden" class="qsId" value="__INDEX__" > <div class="qsImage"><img src="__IMAGE__"/></div><div class="qsRight"><div class="qsClose">&nbsp;</div><div class="qsText">__TITLE__</div><div class="qsCircles">__CIRCLES__<input type="text" placeholder="+ Kreis oder Person hinzufügen" class="qsAddCircle"></div></div></div>';
    this.Templates.Circle='<span class="qsCircle __COLOR__"><span class="innerCircle"><span class="__CLASS__"></span><span class="qsCircleText">__NAME__</span><span class="qsCircleRemove"></span></span></span>';
};

SetupQuickshare.prototype = {
    constructor: SetupQuickshare,
    Events:function() {
        var obj=this;
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
            obj.LoadQs();

            return false;
        });

        $(document).on('click', '.qsClose', function () {
            obj.DeleteQs($(this));
            $(this).closest('.selectedQS').remove();

            return false;
        });

        $(document).on('click', '.qsSelectCircleElement .inner', function () {
            obj.AddElementToQs($(this));
            return false;
        });

        $(document).on('click', '.qsCircleRemove', function () {
            obj.RemoveElementFromQs($(this));
            return false;
        });

        $(document).on('click', '.qsImage img', function () {
            if ($('.qsSelectIcon').is(":hidden") )  {
                obj.SelectedBlock= $(this).closest('.selectedQS');
                obj.MouseOffset= $(this).position();
                var oldPic = $(this).attr("src");
                $(this).attr("src", "../images/icons/gearbox.gif");
                obj.OpenIconSelection(oldPic);
            } else {
                $('.qsSelectIcon').hide();
            }
            return false;
        });

        $(document).on('click', '.qsIconCategoryIcons img', function () {
            var id=obj.SelectedBlock.closest('.selectedQS').find('.qsId').val();
            var bigImage = $(this).attr("src");
            var smallImage = bigImage.replace("/big/", "/small/");
            if (obj.SelectedBlock !== null && obj.SelectedBlock !== undefined) {
                obj.SelectedBlock.find('.qsImage img').attr("src", bigImage);
            }

            var lsqs=localStorage['QuickShares'];
            var qs=JSON.parse(lsqs);
            qs[id].Image=smallImage;
            localStorage.setItem('QuickShares',JSON.stringify(qs));

            $('.qsSelectIcon').fadeOut();
            return false;
        });

        $(document).on('input', '.qsAddCircle', function () {
            obj.GetSelectableElements($(this), $(this).val().toLowerCase());
        });

        $(document).on('click', '.qsAddCircle', function () {
            if ($('.qsDrilldown').length>0) {
                $('.qsDrilldown').remove();
            } else {
                obj.GetSelectableElements($(this), $(this).val().toLowerCase());
            }
        });
    },

    GetForbiddenElements:function(parent) {
        var forbiddenValues = [];
        parent.find('.qsCircleText').each(function (index, value) {
            forbiddenValues.push($(value).text().toLowerCase());
        });
        return forbiddenValues;
    },
    IsForbidden:function (forbiddenElements, element) {
        return $.inArray(element, forbiddenElements)>-1;
    },
    AddElementToQs:function ( element) {
        var wrapper=element.closest('.selectedQS');
        var id=wrapper.find('.qsId').val();
        var lsqs=localStorage['QuickShares'];
        var qs=JSON.parse(lsqs);
        var elementName=element.text();


        qs[id].Circles+=(","+elementName);
        localStorage["QuickShares"]=JSON.stringify(qs);
        this.ReloadQs(element.closest(wrapper));
    },

    DeleteQs:function(element) {
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
    },

    RemoveElementFromQs:function (element) {
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
        this.ReloadQs(element.closest(wrapper));
    },

    GetSingleQsCircles:function(qsSetting) {
        var obj=this;
        var retHtml="";
        var allCircles = this.GetAllCircles();
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
                retHtml += obj.Templates.Circle.replace("__CLASS__", type).replace("__COLOR__", color).replace("__NAME__", value);
            }
        });
        return retHtml;
    },

    ReloadQs:function (parent) {
        var id=parent.find('.qsId').val();
        var lsqs=localStorage['QuickShares'];
        var qs=JSON.parse(lsqs);
        var setting=qs[id];

        parent.html($(this.LoadSingleQs(setting,id)).html());
    },

    LoadSingleQs:function (qsSetting, counter) {
        var image=qsSetting.Image;
        if (image.indexOf("chrome-extension")>=0) {
            image=imageHost+"quickshare/small/communication/warnings.png";
        }
        var title=qsSetting.Title;
        if (title===undefined) {
            title="QuickShare "+(parseInt(counter)+1);
        }

        var html=this.Templates.Qs.replace("__IMAGE__",image.replace("/small/","/big/")).replace("__INDEX__",counter).replace("__TITLE__",title);
        return html.replace("__CIRCLES__",this.GetSingleQsCircles(qsSetting));
    },

    LoadQs:function () {
        var obj=this;
        var counter=0;
        var lsqs=localStorage['QuickShares'];
        if (lsqs!==undefined) {
            var qs=JSON.parse(lsqs);
            $('.existingQS').empty();
            qs.forEach(function(value) {
                $('.existingQS').append(obj.LoadSingleQs(value, counter));
                counter++;
            });
        }
    },
    GetAllCircles:function () {
        var obj=this;
        var allCircles = JSON.parse(localStorage["QS.AllCircles"]);
        allCircles.Public = allCircles.Public || obj.Browser.GetMessageFromSetup('Circles_Public');
        allCircles.MyCircles = allCircles.MyCircles || obj.Browser.GetMessageFromSetup('Circles_Private');
        allCircles.ExtendedCircles = allCircles.ExtendedCircles || obj.Browser.GetMessageFromSetup('Circles_Extended');

        return allCircles;
    },
    ReplaceDrilldown:function(forbiddenElements, className, circleName) {
        if (!this.IsForbidden(forbiddenElements,circleName.toLowerCase())) {
            return this.Templates.DrillDownElement.replace("__ICONCLASS__", className).replace("__CIRCLE__", circleName).replace("__TITLE__", circleName);
        } else {
            return "";
        }
    },

    GetSelectableElements:function (element, preselection) {
        var obj=this;
        if ($('.qsDrilldown').length>0) {
            $('.qsDrilldown').remove();
        }
        var forbiddenElements=obj.GetForbiddenElements(element.closest('.qsCircles'));
        var allCircles=obj.GetAllCircles();
        var allElements = "<div class='qsDrilldown' style='left: " + element.position().left + "px; top:" + (element.position().top + 23) + "px;'>";

        if (preselection === undefined || allCircles.Public.toLowerCase().indexOf(preselection) >= 0) {
            allElements+=obj.ReplaceDrilldown(forbiddenElements, "qsPublic", allCircles.Public);
        }
        if (preselection === undefined || allCircles.MyCircles.toLowerCase().indexOf(preselection) >= 0) {
            allElements+=obj.ReplaceDrilldown(forbiddenElements,"qsMyCircles", allCircles.MyCircles);
        }
        if (preselection === undefined || allCircles.ExtendedCircles.toLowerCase().indexOf(preselection) >= 0) {
            allElements+=obj.ReplaceDrilldown(forbiddenElements,"qsExtendedCircles", allCircles.ExtendedCircles);
        }
        if (allCircles.Circles !== undefined) {
            allCircles.Circles.sort();
            allCircles.Circles.forEach(function (circle) {
                if (preselection === undefined || circle.toLowerCase().indexOf(preselection) >= 0) {
                    allElements+=obj.ReplaceDrilldown(forbiddenElements,"qsSingleCircle", circle);
                }
            });
        }
        if (allCircles.Communities !== undefined) {
            allCircles.Communities.sort();
            allCircles.Communities.forEach(function (community) {
                if (preselection === undefined || community.toLowerCase().indexOf(preselection) >= 0) {
                    allElements+=obj.ReplaceDrilldown(forbiddenElements,"qsCommunity", community);
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
    },
    GetAllFolders:function() {
        return JSON.parse(this.Browser.GetMessageFromSetup('QuickShare_Folders'));
    },

    GetIconListForFolder:function(folderData, redirect) {
        var obj=this;
        var imageHtml = "";
        var imageFolder = imageHost + "quickshare/big/" + folderData.file;
        $.get(imageFolder + "/folder.php", function (data) {
            data.forEach(function (value) {
                if (value.indexOf(".png") > 0) {
                    imageHtml += obj.Templates.SingleImage.replace("__PATH__", imageFolder).replace("__FILE__", value);
                }
            });
            var folderHtml = obj.Templates.Folder.replace("__CATEGORY__", folderData.text).replace("__ICONS__", imageHtml);
            obj.CompleteIconList+= folderHtml;
            redirect();
        });
    },
    GetNextFolder:function (oldPic, folder) {
        var obj=this;
        if (obj.AllFolders.length === 0) {
            obj.DisplayIcons(oldPic);
        } else {
            var singleFolder = this.AllFolders.pop();
            obj.GetIconListForFolder(singleFolder, function () {
                obj.GetNextFolder(oldPic,folder);
            });
        }
    },
    DisplayIcons:function(oldPic) {
        $('.qsSelectIcon').css('left', this.MouseOffset.left + 120);
        $('.qsSelectIcon').css('top', this.MouseOffset.top) + 20;

        $('.qsSelectIcon').append($(this.CompleteIconList));
        $('.qsSelectIcon').fadeIn();
        this.SelectedBlock.find('.qsImage img').attr('src',oldPic);
    },
    OpenIconSelection:function (oldPic) {
        $('.qsSelectIcon').empty();
        if (this.CompleteIconList== undefined) {
            this.AllFolders= this.GetAllFolders();
            if (this.AllFolders.length > 0) {
                this.CompleteIconList = "";
                this.GetNextFolder(oldPic);
            }
        } else {
            this.DisplayIcons(oldPic);
        }
    },
    GetLangFromUrl: function () {
        var url = location.href;
        var lastSlash = url.lastIndexOf("/");
        var lang = url.substr(lastSlash - 2, 2);
        return lang;
    }
};