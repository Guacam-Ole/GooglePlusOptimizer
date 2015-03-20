/**
 * Created by Tomato on 04.02.2015.
 */
var imageHost = "https://files.oles-cloud.de/optimizer/";
var mouseOffset;
var selectedBlock;
var completeIconList;
var allFolders;
this.Browser = new Browser();
this.Browser.LoadMessagesForSetup();

$(document).ready(function(){
    LoadQs();
});

