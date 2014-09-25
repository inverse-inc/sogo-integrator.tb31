/* -*- Mode: java; tab-width: 2; c-tab-always-indent: t; indent-tabs-mode: t; c-basic-offset: 2 -*- */

function jsInclude(files, target) {
	var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
		.getService(Components.interfaces.mozIJSSubScriptLoader);
	for (var i = 0; i < files.length; i++) {
		try {
			loader.loadSubScript(files[i], target);
		}
		catch(e) {
			dump("preferences-overlay.js: failed to include '" + files[i] + "'\n" + e + "\n");
		}
	}
}

jsInclude(["chrome://inverse-library/content/sogoWebDAV.js",
					 "chrome://sogo-integrator/content/sogo-config.js"]);

window.addEventListener("load", onLoadOverlay, false);

var folderURL = "";
var originalName = "";

function onLoadOverlay() {
	if (window.arguments && window.arguments[0]) {
		folderURL = document.getElementById("groupdavURL").value;
		originalName = document.getElementById("description").value;
	}
}

function onOverlayAccept() {
	var rc;

	var newFolderURL = document.getElementById("groupdavURL").value;
	var newName = document.getElementById("description").value;
	if (newFolderURL.indexOf(sogoBaseURL()) > -1
			&& newFolderURL == folderURL
			&& newName != originalName) {
		var proppatch = new sogoWebDAV(newFolderURL,
																	 new renameTarget(this), undefined, undefined, true);
		proppatch.proppatch("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
												+ "<propertyupdate xmlns=\"DAV:\">"
												+ "<set>"
												+ "<prop><displayname>" + xmlEscape(newName)
												+ "</displayname>"
												+ "</prop></set></propertyupdate>");
		rc = false;
	}
	else
		rc = onAccept();

	return rc;
}

function renameTarget(dlg) {
	this.dialog = dlg;
}

renameTarget.prototype = {
 onDAVQueryComplete: function(status, jsonResult) {
		var correct = false;

		if (status == 207) {
			var responses = jsonResult["multistatus"][0]["response"];
			for each (var response in responses) {
				var url = response["href"][0];
				if (this.dialog.folderURL.indexOf(url) > -1) {
					for each (var propstat in response["propstat"]) {
						if (propstat["status"][0].indexOf("HTTP/1.1 200") == 0) {
							if (propstat["prop"][0]["displayname"]) {
								if (onAccept())
									setTimeout("window.close();", 200);
							}
						}
					}
				}
			}
		}
		else {
			var strBundle = document.getElementById("preferencesMessages");
			window.alert(strBundle.getString("serverUpdateFailed") + "\n" + status);
		}
	}
};
