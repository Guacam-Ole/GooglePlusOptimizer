/**
 * Import/Export configuration
 * 
 * @author magdev
 */


function exportConfig() {
    var keys = Object.keys(localStorage),
    	config = {};
    
    for (var i = 0; i < keys.length; i++) {
    	switch (keys[i]) {
    		case 'Circles':
    	        config[keys[i]] = JSON.parse(localStorage.getItem(keys[i]));
    			break;
    		
    		case 'fulltext':
    		case 'hashTags':
    	        config[keys[i]] = localStorage.getItem(keys[i]).split(',');
    			break;
    			
    		default:
    	        config[keys[i]] = localStorage.getItem(keys[i]);
    			break;
    	}
    }
    return config;
}


function importConfig(config) {
	for (key in config) {
		switch (key) {
		case 'Circles':
			localStorage.setItem(key, JSON.stringify(config[key]));
			break;
		
		case 'fulltext':
		case 'hashTags':
			localStorage.setItem(key, config[key].join(','));
			break;
			
		default:
			localStorage.setItem(key, config[key]);
			break;
		}
	}
}


$(document).ready(function() {
	var loadHandler = function(ev) {
	    	var content = ev.target.result;
	    	if (content.length > 0) {
	    	    importConfig(JSON.parse(content));
	    		
	    		chrome.tabs.query({active: true}, function(tabs) {
	    			chrome.tabs.reload(tabs[0].id);
	    		});
	    	}
	    },
		
		exportHandler = function(ev) {
			try {
				var config = exportConfig(),
					blob = new Blob([JSON.stringify(config)], {type: 'application/json'});
			    saveAs(blob, 'gplus-optimizer-config.json');
			} catch(e) {
				console.log(e);
			}
		},
		
		importHandler = function(ev1) {
			try {
				var file = ev1.currentTarget.files[0];
				if (file) {
				    var reader = new FileReader();
				    reader.readAsText(file, 'UTF-8');
				    reader.onload = loadHandler;
				}
			} catch(e) {
				console.log(e);
			}
		};
	
	$('#exportConfig').click(exportHandler);
	$('#importConfig').click(function(ev) {
		ev.stopImmediatePropagation();
		$('#importConfigFile').click();
	});
	$('#importConfigFile').change(importHandler);
});