function jsInclude(files, target) {
    let loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
                           .getService(Components.interfaces.mozIJSSubScriptLoader);
    for (let i = 0; i < files.length; i++) {
        try {
            loader.loadSubScript(files[i], target);
        }
        catch(e) {
            dump("calendars-list-overlay.js: failed to include '" + files[i] + "'\n"
                 + e + "\n");
        }
    }
}

jsInclude(["chrome://sogo-integrator/content/sogo-config.js",
           "chrome://sogo-integrator/content/messenger/folders-update.js"]);

window.addEventListener("load", onInverseCalendarsListOverlayLoad, false);

let sogoCalendarsAvailable = false;

function onInverseCalendarsListOverlayLoad() {
    let popup = document.getElementById("list-calendars-context-menu");
    let properties = document.getElementById("list-calendars-context-edit");
    let showonly = document.getElementById("list-calendars-context-sogo-showonly");
    let showall = document.getElementById("list-calendars-context-sogo-showall");
    let separator = document.createElement("menuseparator");
    popup.removeChild(properties);
    popup.insertBefore(separator, popup.firstChild);
    popup.insertBefore(properties, popup.firstChild);

    separator = document.createElement("menuseparator");
    popup.insertBefore(separator, popup.firstChild);
    popup.insertBefore(showall, popup.firstChild);
    popup.insertBefore(showonly, popup.firstChild);

    let controller = new SICalendarListTreeController();
    let calendarTree = document.getElementById("calendar-list-tree-widget");
    calendarTree.tree.controllers.appendController(controller);

    popup.addEventListener("popupshowing", onCalendarTreePopup, false);
}

function onCalendarTreePopup(event) {
    goUpdateCommand("calendar_manage_sogo_acls_command");
}

function SICalendarListTreeController() {
}

SICalendarListTreeController.prototype = {
    supportsCommand: function(command) {
        return (command == "calendar_manage_sogo_acls_command");
    },

    isCommandEnabled: function(command) {
        let isEnabled;

        if (command == "calendar_manage_sogo_acls_command") {
            let calendar = getSelectedCalendar();

            let userIsOwner = true;
            let entry = calendar.aclEntry;
            if (entry && entry.hasAccessControl && !entry.userIsOwner) {
                userIsOwner = false;
            }

            let acl_menuitem = document.getElementById("list-calendars-context-sogo-acls");
            let delete_menuitem = document.getElementById("list-calendars-context-delete");
            if (userIsOwner) {
                acl_menuitem.label = acl_menuitem.getAttribute("managelabel");
                delete_menuitem.label = delete_menuitem.getAttribute("deletelabel");
            } else {
                acl_menuitem.label = acl_menuitem.getAttribute("reloadlabel");
                delete_menuitem.label = delete_menuitem.getAttribute("unsubscribelabel");
            }

            let isSOGoEntry = false;
            let length = sogoBaseURL().length;
            if (calendar.uri.spec.substr(0, length) == sogoBaseURL()) {
                isSOGoEntry = true;
            }

            if (isSOGoEntry) {
                if (!sogoCalendarsAvailable) {
                    let CalendarChecker = new directoryChecker("Calendar");
                    let yesCallback = function () {
                        sogoCalendarsAvailable = true;
                        goUpdateCommand("calendar_manage_sogo_acls_command");
                    };
                    CalendarChecker.checkAvailability(yesCallback);
                }
                isEnabled = sogoCalendarsAvailable;
            }
            else {
                isEnabled = false;
            }
        } else {
            isEnabled = true;
        }

        return isEnabled;
    },

    doCommand: function(command) { dump("doCommand\n"); },

    onEvent: function(event) { dump("onEvent\n"); }
};
