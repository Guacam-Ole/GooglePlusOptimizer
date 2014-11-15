var gpoFlags=function() {
    this.Languages = [
        {short: "de", img: "Germany"}, {short: "en-uk", img: "United_Kingdom"}, {short: "es", img: "Spain"}, {short: "pt", img: "Portugal"},
        {short: "fr", img: "France"}, {short: "ru", img: "Russia"}, {short: "hr", img: "Croatia"}, {short: "no", img: "Norway"},
        {short: "da", img: "Denmark"}, {short: "fi", img: "Finland"}, {short: "sv", img: "Sweden"}, {short: "tr", img: "Turkey"},
        {short: "it", img: "Italy"}, {short: "pl", img: "Poland"}, {short: "ja", img: "Japan"}, {short: "en-us", img: "United_States"}
    ];    
};

gpoFlags.prototype = {
    constructor: gpoFlags,
    Init: function () {},
    Dom:function()  {
        if ($('.langSelect').length === 0) {
            var obj=this;
            var languageSelector = "<span class='langSelect'>";
            languageSelector += "<a><img class='langOpen' src='" + chrome.extension.getURL('setup/images/icons/small/unknown.png') + "'/></a>";
            languageSelector += "<span class='langAll'>";
             
            $.each(obj.Languages, function() {
                languageSelector+=obj.GetLangImage(this.short,this.img);
            });

            languageSelector += "</span></span>";
            $('.Pzc').prepend($(languageSelector));

            $('.langOpen').click(function () {
                $(this).closest('.langSelect').find('.langAll').toggle();
                return false;
            });
            $('.langAll img').click(function () {
                var thisImage = $(this).attr("src");
                $(this).closest('.langSelect').find('.langOpen').attr("src", thisImage);
                $(this).closest('.langSelect').find('.langAll').toggle();
                
                window.location.href = location.protocol + '//' + location.host + location.pathname + '?hl=' + $(this).data("short");
                return false;
            });
            var oldLang = getUrlParameter('hl');
            
            if (oldLang===null || oldLang===undefined) {
                oldLang= window.navigator.userLanguage || window.navigator.language;
            }
            
            if (oldLang!==undefined && oldLang!==null) {
                oldLang=oldLang.toLowerCase();
                var selectedLang = $.grep(obj.Languages, function(e){ return e.short === oldLang; });
                if(selectedLang.length>0) {
                   $('.langOpen').attr("src", chrome.extension.getURL('setup/images/icons/small/flags/' +  selectedLang[0].img + '_24.png'));
                }
            }
        }
    },
    GetLangImage:function(short,img) {
         return '<a><img data-short="'+short+'" title="'+img+'" src="' + chrome.extension.getURL('setup/images/icons/small/flags/' + img + '_24.png') + '"/></a>';
    }
};

