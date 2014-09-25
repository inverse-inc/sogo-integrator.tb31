function jsInclude(files, target) {
    let loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
                           .getService(Components.interfaces.mozIJSSubScriptLoader);
    for (let i = 0; i < files.length; i++) {
        try {
            loader.loadSubScript(files[i], target);
        }
        catch(e) {
            dump("categories.js: failed to include '" + files[i] + "'\n" + e + "\n");
        }
    }
}

jsInclude(["chrome://inverse-library/content/sogoWebDAV.js",
           "chrome://sogo-connector/content/addressbook/categories.js",
           "chrome://sogo-integrator/content/sogo-config.js"]);

let SIContactCategories = {
    synchronizeToServer: function SICC_synchronizeToServer() {
        let cats = SCContactCategories.getCategoriesAsArray();
        if (cats) {
            let collectionURL = sogoBaseURL() + "Contacts/";
	    let proppatch = new sogoWebDAV(collectionURL, null, null, true, true);
            let catxml = "<i:contacts-categories>";
            for (let i = 0; i < cats.length; i++) {
                catxml += "<i:category>" + xmlEscape(cats[i]) + "</i:category>";
            }
            catxml += "</i:contacts-categories>";

            let proppatchxml = ("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
		                + "<propertyupdate xmlns=\"DAV:\""
                                + " xmlns:i=\"urn:inverse:params:xml:ns:inverse-dav\">"
			        + "<set>"
			        + "<prop>" + catxml + "</prop>"
                                + "</set></propertyupdate>");
	    proppatch.proppatch(proppatchxml);
        }
    },
    synchronizeFromServer: function SICC_synchronizeFromServer() {
        let categoriesListener = {
            onDAVQueryComplete: function onDAVQueryComplete(status, response, headers) {
                if (status == 207) {
                    let jsonResponse = response["multistatus"][0]["response"][0];
                    let propstats = jsonResponse["propstat"];
                    for (let i = 0; i < propstats.length; i++) {
                        let propstat = propstats[i];
                        if (propstat["status"][0].indexOf("200") > 0
                            && propstat["prop"][0]
                            && propstat["prop"][0]["contacts-categories"][0]) {
                            let cats = propstat["prop"][0]["contacts-categories"][0]["category"];
                            SCContactCategories.setCategoriesAsArray(cats);
                        }
                    }
                }
            }
        };

        let properties = ["urn:inverse:params:xml:ns:inverse-dav contacts-categories"];
        let propfind = new sogoWebDAV(sogoBaseURL() + "Contacts", categoriesListener, undefined, undefined, true);
        propfind.propfind(properties, false);
    }
};
