$(document).ready(function() 
{
	var lang = chrome.i18n.getMessage("lang");
	if (lang=="de") 
	{
		window.location.replace("./de/index.html");
	}
	else if (lang=="en") 
	{
		window.location.replace("./en/index.html");
	}		
}); 