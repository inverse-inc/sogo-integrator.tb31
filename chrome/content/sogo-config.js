/* -*- Mode: java; tab-width: 2; c-tab-always-indent: t; indent-tabs-mode: t; c-basic-offset: 2 -*- */
var sogoConfig = { username: null, baseURL: null };

function sogoUserName() {
	if (!sogoConfig['username']) {
		var mgr = Components.classes["@mozilla.org/messenger/account-manager;1"]
			.getService(Components.interfaces.nsIMsgAccountManager);
		var prefService = (Components.classes["@mozilla.org/preferences-service;1"]
											 .getService(Components.interfaces.nsIPrefBranch));
		var useEmail = false;
		try {
			useEmail = prefService.getBoolPref("sogo-integrator.identification.use_email_address");
		}
		catch(e) {
			useEmail = false;
		}
		if (useEmail)
			sogoConfig['username'] = mgr.defaultAccount.defaultIdentity.email;
		else
			sogoConfig['username'] = mgr.defaultAccount.incomingServer.realUsername;
	}

	return sogoConfig['username'];
}

function sogoHostname() {
	var hostnameArray;
	var baseURL;

	baseURL = sogoBaseURL();
	hostnameArray = baseURL.split("/");

	return hostnameArray[0] + "//" + hostnameArray[2];
}

function sogoBaseURL() {
	if (!sogoConfig['baseURL']) {
		var rdf = Components.classes["@mozilla.org/rdf/rdf-service;1"]
												.getService(Components.interfaces.nsIRDFService);
		var extensions
			= rdf.GetResource("http://inverse.ca/sogo-integrator/extensions");
		var updateURLres
			= rdf.GetResource("http://inverse.ca/sogo-integrator/updateURL");
		var ds
			= rdf.GetDataSourceBlocking("chrome://sogo-integrator/content/extensions.rdf");

		var updateArray;
		try {
			var urlNode = ds.GetTarget(extensions, updateURLres, true);
			if (urlNode instanceof Components.interfaces.nsIRDFLiteral) {
				var updateURL = urlNode.Value;
				updateArray = updateURL.split("/");
			}
		}
		catch (e) {
		}

		var prefService = (Components.classes["@mozilla.org/preferences-service;1"]
																 .getService(Components.interfaces.nsIPrefBranch));
		var sogoPrefix;
		try {
			sogoPrefix = "/" + prefService.getCharPref("sogo-integrator.sogo-prefix");
		}
		catch(e) {
			sogoPrefix = "/SOGo";
		}

		sogoConfig['baseURL'] = (updateArray[0] + "//" + updateArray[2]
														 + sogoPrefix + "/dav/" + sogoUserName() + "/");
	}

	return sogoConfig['baseURL'];
}
