function jsInclude(files, target) {
    let loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
                           .getService(Components.interfaces.mozIJSSubScriptLoader);
    for (let i = 0; i < files.length; i++) {
        try {
            loader.loadSubScript(files[i], target);
        }
        catch(e) {
            dump("common-card-overlay.js: failed to include '" + files[i] + "'\n" + e + "\n");
        }
    }
}

jsInclude(["chrome://inverse-library/content/sogoWebDAV.js",
           "chrome://sogo-connector/content/addressbook/categories.js",
           "chrome://sogo-integrator/content/addressbook/categories.js",
           "chrome://sogo-integrator/content/sogo-config.js"]);

let SICommonCardOverlay = {
    initialCategories: null,

    onLoadHook: function SICO_onLoad() {
        this.initialCategories = SCContactCategories.getCategoriesAsString();

        let this_ = this;
        window.addEventListener("unload",
                                function () { this_.onUnload(); },
                                false);
    },

    onUnload: function SICO_onUnload(event) {
        let newCategories = SCContactCategories.getCategoriesAsString();
        if (newCategories != this.initialCategories) {
            SIContactCategories.synchronizeToServer();
        }
    }
};

let SCOnCommonCardOverlayLoadPreHook = function() { SICommonCardOverlay.onLoadHook(); };
