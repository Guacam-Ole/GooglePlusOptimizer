
var languages = [
    {short: "de", img: "Germany"}, {short: "en", img: "United_Kingdom"}, {short: "es", img: "Spain"}, {short: "pt", img: "Portugal"},
    {short: "fr", img: "France"}, {short: "ru", img: "Russia"}, {short: "hr", img: "Croatia"}, {short: "no", img: "Norway"},
    {short: "da", img: "Denmark"}, {short: "fi", img: "Finland"}, {short: "sv", img: "Sweden"}, {short: "tr", img: "Turkey"},
    {short: "it", img: "Italy"}, {short: "pl", img: "Poland"}, {short: "ja", img: "Japan"}

]

function GetLangImage(short, img) {
    return '<a href="' + location.protocol + '//' + location.host + location.pathname + '?hl=' + short + '"><img src="' + chrome.extension.getURL('setup/images/icons/small/flags/' + img + '_24.png') + '"/></a>';
}

function WhatsHot() {
    if (showLang) {
        if ($('.langSelect').length === 0) {
            
            var languageSelector = "<span class='langSelect'>";
            languageSelector += "<a><img class='langOpen' src='" + chrome.extension.getURL('setup/images/icons/small/unknown.png') + "'/></a>";
            languageSelector += "<span class='langAll'>";
             
            $.each(languages, function() {
                languageSelector+=GetLangImage(this.short,this.img);
            });

            languageSelector += "</span></span>";
            $('.Pzc').prepend($(languageSelector));

            $('.langOpen').click(function () {
                $(this).closest('.langSelect').find('.langAll').toggle();
                return false;
            });
            $('.langAll img').click(function () {
                thisImage = $(this).attr("src");
                $(this).closest('.langSelect').find('.langOpen').attr("src", thisImage);
                $(this).closest('.langSelect').find('.langAll').toggle();
                this.location.href = $(this).closest('a').attr('href');
            });
            var oldLang = getUrlParameter('hl');
            
            if (oldLang===null || oldLang===undefined) {
                oldLang= window.navigator.userLanguage || window.navigator.language;
                if (oldLang.length>2) {
                    oldLang=oldLang.substr(0,2);
                }
            }
            
            if (oldLang!==undefined && oldLang!==null) {
                var selectedLang = $.grep(languages, function(e){ return e.short === oldLang; });
                if(selectedLang.length>0) {
                   $('.langOpen').attr("src", chrome.extension.getURL('setup/images/icons/small/flags/' +  selectedLang[0].img + '_24.png'));
                }
            }
        }
    }
}