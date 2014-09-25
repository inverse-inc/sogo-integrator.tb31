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

function SIAbPanelLoad(event) {
	let menu = document.getElementById("addressbookList");
	if (!menu.value || menu.value == ""
			|| menu.value == "moz-abmdbdirectory://abook.mab"
			|| menu.value == "moz-abmdbdirectory://history.mab") {
		let handler = new AddressbookHandler();
		let existing = handler.getExistingDirectories();
		let personalURL = sogoBaseURL() + "Contacts/personal/";
		let directory = existing[personalURL]
			.QueryInterface(Components.interfaces.nsIRDFResource);
		menu.value = directory.Value;
	}

	this.SIAbPanelLoadOld();
}

function SOGoGetPersonalAddressBookURL() {
	let handler = new AddressbookHandler();
	let existing = handler.getExistingDirectories();
	let personalURL = sogoBaseURL() + "Contacts/personal/";
	let directory = existing[personalURL].QueryInterface(Components.interfaces.nsIRDFResource);

	return directory.Value;
}

this.SIAbPanelLoadOld = this.AbPanelLoad;
this.AbPanelLoad = this.SIAbPanelLoad;
