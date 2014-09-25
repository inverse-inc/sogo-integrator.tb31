/* -*- Mode: java; tab-width: 2; c-tab-always-indent: t; indent-tabs-mode: t; c-basic-offset: 2 -*- */

let acceptedFromObserver = false;
let passwordObserver = null;

function jsInclude(files, target) {
	let loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
		.getService(Components.interfaces.mozIJSSubScriptLoader);
	for (let i = 0; i < files.length; i++) {
		try {
			loader.loadSubScript(files[i], target);
		}
		catch(e) {
			dump("common-dialog-overlay.js: failed to include '" + files[i] + "'\n"
					 + e + "\nFile: " + e.fileName + 
					 "\nLine: " + e.lineNumber + "\n\n Stack:\n\n" + e.stack);
		}
	}
}

jsInclude(["chrome://sogo-integrator/content/sogo-config.js"]);

function SIPasswordObserver(dialog, field, checkbox) {
	this.dialog = dialog;
	this.field = field;
	this.checkbox = checkbox;
}

SIPasswordObserver.prototype = {
 dialog: null,
 field: null,
 checkbox: null,
 observe: function(subject, topic, data) {
		if (topic && topic == "sogo.password") {
			acceptedFromObserver = true;
			let password = data.substr(1);
			let checked = (data[0] == "1");
			this.field.password = password;
			this.checkbox.checked = checked;
			gCommonDialogParam.SetInt(1, checked);
			this.dialog.acceptDialog();
		}
	},
 QueryInterface: function(aIID) {
		if (!aIID.equals(Components.interfaces.nsIObserver)
				&& !aIID.equals(Components.interfaces.nsISupports))
			throw Components.results.NS_ERROR_NO_INTERFACE;

		return this;
	}
};

function _SIAuthenticationContext() {
	let contextMgr = Components.classes["@inverse.ca/context-manager;1"]
		.getService(Components.interfaces.nsISupports)
		.wrappedJSObject;
	return contextMgr.getContext("sogo-authentication");
}

function _SIGetDialogType() {
	let description = document.getElementById("info.body");
	let text = description.textContent + "";

	let serverBaseURLParts = sogoBaseURL().split("/");
	let serverBaseURL = serverBaseURLParts[0] + "//" + serverBaseURLParts[2];
	let mailserver = Components.classes["@mozilla.org/messenger/account-manager;1"]
														 .getService(Components.interfaces.nsIMsgAccountManager)
														 .defaultAccount.incomingServer;
	let mailUserLogin = mailserver.realUsername + "@" + mailserver.realHostName;
	let smtpServer = Components.classes["@mozilla.org/messengercompose/smtp;1"]
								             .getService(Components.interfaces.nsISmtpService)
														 .defaultServer.hostname;

	let dialogType;
	if (text.indexOf("SOGo") > -1 && text.indexOf(serverBaseURL) > -1) {
		dialogType = "sogo";
	}
	else if (text.indexOf(mailUserLogin) > -1) {
		dialogType = "mail";
	}
	else if (text.indexOf(mailserver.realUsername) > -1
					 && text.indexOf(smtpServer) > -1) {
		dialogType = "smtp";
	}
	else {
		dialogType = "none";
		/* pop3 dialogs */
		let indexUsername = text.indexOf(mailserver.realUsername);
		if (indexUsername > -1) {
			let indexServername = text.indexOf(mailserver.realHostName);
			if (indexServername > indexUsername)
				dialogType = "mail";
		}
	}

	return dialogType;
}

function _SISetTitles() {
	let label = document.getElementById("password1Label");
	label.setAttribute("collapsed", "true");

	let bundle = document.getElementById("SICDStrings");
	document.title = bundle.getString("sogo.title");

	let description = document.getElementById("info.body");
	description.textContent = bundle.getString("sogo.description").replace("%u", sogoUserName());
}

function SICommonDialogOnLoad() {
	window.SIOldCommonDialogOnLoad();

	/* This is pure evil and breaks the order of things! */
	let dialogType = _SIGetDialogType();
	if (dialogType != "none") {
		_SISetTitles();
		let context = _SIAuthenticationContext();
		let passwordField = document.getElementById("password1Textbox");
		let checkbox = document.getElementById("checkbox");

		let password;
		if (context.password) {
			password = context.password;
			checkbox.checked = (context.checked != false);
			gCommonDialogParam.SetInt(1, context.checked);
		}
		else
			password = passwordField.value;

		if (dialogType == "sogo") {
			let loginContainer = document.getElementById("loginContainer");
			loginContainer.hidden = true;
			let username = document.getElementById("loginTextbox");
			username.value = sogoUserName();
		}

		if (!context.tries)
			context.tries = {};
		let tries = 1;
		if (context.tries[dialogType]) {
			tries = context.tries[dialogType] + 1;
		}

		let dialog = document.getElementById("commonDialog");
		if (password == "" || tries > 2) {
			window.SIOldCommonDialogOnAccept = window.commonDialogOnAccept;
			window.commonDialogOnAccept = window.SICommonDialogOnAccept;
			passwordField.focus();
			passwordField.value = "";

			context.tries[dialogType] = 0;

			dialog.addEventListener("dialogcancel", SIOnDialogCancel, false);
			passwordObserver = new SIPasswordObserver(dialog, passwordField,
																								checkbox);
			let obsService = Components.classes["@mozilla.org/observer-service;1"]
				.getService(Components.interfaces.nsIObserverService);
			obsService.addObserver(passwordObserver, "sogo.password", false);
		}
		else {
			context.tries[dialogType] = tries;
			passwordField.value = password;
			dialog.acceptDialog();
		}
	}
}

function SICommonDialogOnAccept() {
	let obsService = Components.classes["@mozilla.org/observer-service;1"]
		.getService(Components.interfaces.nsIObserverService);
	obsService.removeObserver(passwordObserver, "sogo.password");
	if (!acceptedFromObserver) {
		let passwordField = document.getElementById("password1Textbox");
		let password = passwordField.value + "";
		let context = _SIAuthenticationContext();
		context.password = password;
		let checkbox = document.getElementById("checkbox");
		let checked = checkbox.checked ? "1" : "0";
		context.checked = checked;

		let data = checked + password;
		obsService.notifyObservers(null, "sogo.password", data);
	}

	return window.SIOldCommonDialogOnAccept();
}

function SIOnDialogCancel(event) {
	let obsService = Components.classes["@mozilla.org/observer-service;1"]
		.getService(Components.interfaces.nsIObserverService);
	obsService.removeObserver(passwordObserver, "sogo.password");
}

window.SIOldCommonDialogOnLoad = window.commonDialogOnLoad;
window.commonDialogOnLoad = window.SICommonDialogOnLoad;
