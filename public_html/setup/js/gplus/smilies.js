var gpoEmoticons = function () {
    this.Emoticons = '[{"img": "baby.gif","short": ":baby:"},'
    + '{"img": "biggrin.png","short": ":D"},'
    + '{"img": "biggrin.png","short": ":-D"},'
    + '{"img": "cat.png","short": ":cat:"},'
    + '{"img": "clap.gif","short": ":clap:"},'
    + '{"img": "confused.png","short": "?("},'
    + '{"img": "cool.png","short": "8)"},'
    + '{"img": "cool.png","short": "8-)"},'
    + '{"img": "crying.gif","short": ";("},'
    + '{"img": "crying.gif","short": ";-("},'
    + '{"img": "essen.png","short": ":eat:"},'
    + '{"img": "gruebel.gif","short": ":think:"},'
    + '{"img": "handshake.gif","short": ":hs:"},'
    + '{"img": "help.png","short": ":help:"},'
    + '{"img": "hand.gif","short": ":wink:"},'
    + '{"img": "kiss.gif","short": ":X"},'
    + '{"img": "kiss.gif","short": ":-X"},'
    + '{"img": "knot.png","short": ":knot:"},'
    + '{"img": "love.png","short": ":love:"},'
    + '{"img": "love.png","short": "♡"},'
    + '{"img": "love.png","short": "♥"},'
    + '{"img": "love.png","short": "❤"},'
    + '{"img": "party.png","short": ":*)"},'
    + '{"img": "cheer.gif","short": "\\\\o\\/"},'
    + '{"img": "patsch.png","short": ":facepalm:"},'
    + '{"img": "pflaster.png","short": ":-#"},'
    + '{"img": "police.png","short": ":police:"},'
    + '{"img": "rofl.gif","short": ":rofl:"},'
    + '{"img": "rolleyes.png","short": ":rolleyes:"},'
    + '{"img": "sad.png","short": ":("},'
    + '{"img": "sad.png","short": ":-("},'
    + '{"img": "pauli.gif","short": ":pauli:"},'
    + '{"img": "sad.png","short": "☹"},'
    + '{"img": "smile.png","short": ":)"},'
    + '{"img": "smile.png","short": ":-)"},'
    + '{"img": "smile.png","short": "☺"},'
    + '{"img": "squint.png","short": "^^"},'
    + '{"img": "thumbdown.png","short": ":thumbdown:"},'
    + '{"img": "thumbsup.png","short": ":thumbsup:"},'
    + '{"img": "thumbup.png","short": ":thumb:"},'
    + '{"img": "tongue.png","short": ":P"},'
    + '{"img": "tongue.png","short": ":-P"},'
    + '{"img": "winki.png","short": ";)"},'
    + '{"img": "winki.png","short": ";-)"},'
    + '{"img": "arghs.png","short": ":shocked:"},'
    + '{"img": "arge.gif","short": ":mad:"},'
    + '{"img": "woot.png","short": "8o"}]';

};

gpoEmoticons.prototype = {
    constructor: gpoEmoticons,
    Dom: function ($ce) {
        this.PaintEmoticons($ce);
    },
    Init:function() {
    },
    PaintInner:function($element) {
        var obj = this;
        var smilies = JSON.parse(obj.Emoticons);
        var smilieCount = 0;
        for (var i in smilies) {
            var smilie = smilies[i];
            if ($element.text().indexOf(" " + smilie.short) >= 0) {
                $element.html($element.html().replaceAll(" " + smilie.short, " <img align=\"absbottom\" src=\"" + chrome.extension.getURL("./setup/images/emoticons/" + smilie.img) + "\"/>"));
                smilieCount++;
            }
        }
        if (smilieCount > 0) {
            var oldHeight = $element.parent().height();
            $element.parent().css('max-height', (oldHeight + 40) + 'px');
        }
    },
    PaintEmoticons: function ($ce) {
        var obj = this;


            $ce.find('.wftCae').each(function () {
                obj.PaintInner($(this));
            });
    }
};
