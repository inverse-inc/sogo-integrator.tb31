/* -*- Mode: java; tab-width: 2; c-tab-always-indent: t; indent-tabs-mode: t; c-basic-offset: 2 -*- */

function jsInclude(files, target) {
	let loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
		.getService(Components.interfaces.mozIJSSubScriptLoader);
	for (let i = 0; i < files.length; i++) {
		try {
			loader.loadSubScript(files[i], target);
		}
		catch(e) {
			dump("newcard-overlay.js: failed to include '" + files[i] + "'\n" + e + "\n");
		}
	}
}

jsInclude(["chrome://sogo-integrator/content/sogo-config.js",
					 "chrome://sogo-integrator/content/addressbook/folder-handler.js"]);

function SIOnNewCardOverlayLoad() {
	if (gEditCard.selectedAB && gEditCard.selectedAB == kPersonalAddressbookURI) {
		let handler = new AddressbookHandler();
		let existing = handler.getExistingDirectories();
		let personalURL = sogoBaseURL() + "Contacts/personal/";
		let directory = existing[personalURL];
		gEditCard.selectedAB = directory.URI;
		document.getElementById("abPopup").value = directory.URI;
	}
}

window.addEventListener("load", SIOnNewCardOverlayLoad, false);
