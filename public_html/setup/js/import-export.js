
function exportConfig() {
    var keys = Object.keys(localStorage),
    	config = {};
    
    for (var i = 0; i < keys.length; i++) {
        config[keys[i]] = localStorage.getItem(keys[i]);
    }
    return config;
}


function importConfig(config) {
	for (key in config) {
		localStorage.setItem(key, config[key]);
	}
	
	chrome.tabs.query({active: true}, function(tabs) {
		chrome.tabs.reload(tabs[0].id);
	});
}


$(document).ready(function() {
	
	$('#exportConfig').click(function(ev) {
		var config = exportConfig(),
			blob = new Blob([JSON.stringify(config)], {type: 'application/json'});
        saveAs(blob, 'gplus-optimizer-config.json');
	});

	$('#importConfig').change(function(ev1) {
		try {
			var file = ev1.currentTarget.files[0];
			if (file) {
			    var reader = new FileReader();
			    reader.readAsText(file, 'UTF-8');
			    reader.onload = function(ev2) {
			    	var content = ev2.target.result;
			    	if (content.length > 0) {
			    	    importConfig(JSON.parse(content));
			    	}
			    };
			}
		} catch(e) {
			console.log(e);
		}
	});
});