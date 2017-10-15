var gpoCommunity = function () {
    this.AllCommunities = undefined;
    this.ShowAll=false;
    this.SortByPosts=true;
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
       $.get('https://plus.google.com/communities', function(result) {

            var mainBlock=$(result).find('.U3P9qe');
            var subBlocks=mainBlock.find('.fNtDS');
            self.AllCommunities=[];
            subBlocks.each(function() {
                var counter=$(this).find('.eyD9Nb').text();
                var inhaber=$(this).find('.pVtChb').text();
                var name=$(this).find('.Wbuh5e').text();
                var url=$($(this).find('a')[0]).attr('href');
                self.AllCommunities.push(
                    {
                        Name: name,
                        Count: counter,
                        Inhaber: inhaber.length>0,
                        Url: url
                    }
                )
            });

            var matches=self.AllCommunities;
            if (!self.ShowAll) {
                matches=matches.filter(self.FilterSelf);
            }
            if (self.SortByPosts) {
                matches.sort((a, b) => a.Count.localeCompare(b.Count));
            } else {
                matches.sort((a, b) => a.Name.localeCompare(b.Name));
            }
            if (self.Limit>0) {
                matches.slice(0,self.Limit-1);
            }
            self.DisplayCommunities=matches;

       });
    },
    FilterSelf:function(community) {
        return community.Inhaber;
    }
}