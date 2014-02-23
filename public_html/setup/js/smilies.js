
function OptStartEmoticons()
{
    console.log("smilies loaded.");
}



function PaintEmoticons() {
    var emoticons = '[{"img": "baby.gif","short": ":baby:"},'
            + '{"img": "biggrin.png","short": ":D"},'
            + '{"img": "biggrin.png","short": ":-D"},'
            + '{"img": "cat.png","short": ":cat:"},'
            + '{"img": "clap.gif","short": ":clap:"},'
            + '{"img": "confused.png","short": "?("},'
            + '{"img": "cool.png","short": "8)"},'
            + '{"img": "crying.gif","short": ";("},'
            + '{"img": "essen.png","short": ":eat:"},'
            + '{"img": "gruebel.gif","short": ":think:"},'
            + '{"img": "handshake.gif","short": ":hs:"},'
            + '{"img": "help.png","short": ":help:"},'
            + '{"img": "kiss.gif","short": ":X"},'
            + '{"img": "knot.png","short": ":knot:"},'
            + '{"img": "love.png","short": ":love:"},'
            + '{"img": "love.png","short": "♡"},'
            + '{"img": "love.png","short": "♥"},'
            + '{"img": "love.png","short": "❤"},'
            + '{"img": "party.png","short": ":*)"},'
            + '{"img": "party.png","short": "\\\\o\\/"},'
            + '{"img": "patsch.png","short": ":facepalm"},'
            + '{"img": "pflaster.png","short": ":-#"},'
            + '{"img": "police.png","short": ":police:"},'
            + '{"img": "rofl.gif","short": ":rofl:"},'
            + '{"img": "rolleyes.png","short": ":rolleyes:"},'
            + '{"img": "sad.png","short": ":("},'
            + '{"img": "sad.png","short": "☹"},'
            + '{"img": "smile.png","short": ":)"},'
            + '{"img": "smile.png","short": ":-)"},'
            + '{"img": "smile.png","short": "☺"},'
            + '{"img": "squint.png","short": "^^"},'
            + '{"img": "thumbdown.png","short": ":thumbdown:"},'
            + '{"img": "thumbsup.png","short": ":thumbsup:"},'
            + '{"img": "thumbup.png","short": ":thumb:"},'
            + '{"img": "tongue.png","short": ":P"},'
            + '{"img": "winki.png","short": ";)"},'
            + '{"img": "winki.png","short": ";-)"},'
            + '{"img": "woot.png","short": "8o"}]';

    var smilies = JSON.parse(emoticons);

    $('.Ct').each(function()
    {
        try {
            for (var i in smilies)
            {
                var smilie = smilies[i];
                if ($(this).text().indexOf(smilie.short) >= 0)
                {
                    $(this).html($(this).html().replaceAll(smilie.short, "<img src=\"" + chrome.extension.getURL("./setup/images/emoticons/" + smilie.img) + "\"/>"));
                }
            }
        } catch (ex) {
            console.log(ex);
        }
    });
}

String.prototype.replaceAll = function(str1, str2, ignore)
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignore ? "gi" : "g")), (typeof (str2) === "string") ? str2.replace(/\$/g, "$$$$") : str2);
};