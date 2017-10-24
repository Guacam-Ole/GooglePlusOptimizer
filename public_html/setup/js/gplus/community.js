var gpoCommunity = function () {
    this.AllCommunities = undefined;
    this.OnlyMine=false;
    this.SortByNumber=true;
    this.Limit=-1;
    this.DisplayCommunities=undefined;
};

gpoCommunity.prototype = {
    constructor: gpoCommunity,
    Init: function () {
        Load();

    },
    Load: function () {
        var self=this;
        $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("./setup/css/quickcommunity.css") + "' type='text/css' media='screen' />"));
       $.get('https://plus.google.com/communities', function(result) {

            var mainBlock=$(result).find('.U3P9qe');
            var subBlocks=mainBlock.find('.fNtDS');
            self.AllCommunities=[];
            subBlocks.each(function() {
                var counter=$(this).find('.eyD9Nb').text();
                if (counter==="") counter="0";
                var inhaber=$(this).find('.pVtChb').text();
                var name=$(this).find('.Wbuh5e').text();
                var url=$($(this).find('a')[0]).attr('href');
                var img=$($(this).find('img.JZUAbb')[0]).attr('src');
                self.AllCommunities.push(
                    {
                        Name: name,
                        Count: counter,
                        Inhaber: inhaber.length>0,
                        Url: url,
                        Img: img
                    }
                )
            });

            var matches=self.AllCommunities;
            if (self.OnlyMine) {
                matches=matches.filter(self.FilterSelf);
            }
            if (self.SortByNumber) {
                matches.sort((a, b) => b.Count.localeCompare(a.Count));
            } else {
                matches.sort((a, b) => a.Name.localeCompare(b.Name));
            }
            if (self.Limit>0) {
                matches=matches.slice(0,self.Limit);
            }
            self.DisplayCommunities=matches;
            self.PaintFloatingIcons();

       });
    },
    FilterSelf:function(community) {
        return community.Inhaber;
    },
    PaintFloatingIcons:function() {
        var self = this;
        var $ce=$('[jsname="WUnDBe"]');
        $ce.css('height','auto');
        $ce=$ce.find('.CjySve');

        var oldBlocks=$ce.find('.quickCommunity');
        if (oldBlocks) {
            oldBlocks.remove();
        }
        $ce.append('<div class="quickCommunity"></div>');
        var singleElement='<a href="URL"><div title="NAME" class="qcBigCircle" style="background-image:url(\'PICTURE\'); background-size:cover">COUNT</div></a>';
        var singleCounter='<div class="qcCountCircle"><span>COUNT</span></div>';
        var header='<br/>'; 
        var footer='<div class="qtFooter" style="clear:both"></div>';

        self.DisplayCommunities.forEach(function(element) {
            var counter="";
            if (element.Count!="0") counter=singleCounter.replace("COUNT",element.Count);
            $ce.find('.quickCommunity').append($(singleElement.replace('PICTURE',element.Img).replace('COUNT',counter).replace('NAME',element.Name).replace('URL',element.Url)));
        });
        $ce.find('.quickCommunity').append(footer);
    },
}