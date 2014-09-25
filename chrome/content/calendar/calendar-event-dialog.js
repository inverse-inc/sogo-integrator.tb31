function SIOnLoadHandler(event) {
    window.SIOldUpdateAttendees = window.updateAttendees;
    window.updateAttendees = window.SIUpdateAttendees;
    window.SIOldOnAccept = window.onAccept;
    window.onAccept = window.SIOnAccept;
    window.SIOldSaveItem = window.saveItem;
    window.saveItem = window.SISaveItem;
    
    SIOldOnLoad();
}

function SIOnAccept() {
    let title = getElementValue("item-title");
    
    if (title.length > 0)
        title = title.replace(/(^\s+|\s+$)/g, "");
    
    if (title.length == 0) {
        let promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
            .getService(Components.interfaces.nsIPromptService);
        let bundle = document.getElementById("bundle_integrator_calendar");

        let flags = promptService.BUTTON_TITLE_OK *
            promptService.BUTTON_POS_0;

        promptService.confirmEx(null,
			        bundle.getString("saveComponentTitle"),
			        bundle.getString("saveComponentMessage"),
			        flags,
			        null,
			        null,
			        null,
			        null,
			        {});
        
        return false;
    }
    return SIOldOnAccept();
}

function SISaveItem() {
    let item = SIOldSaveItem();
    
    // We remove this unconditionaly in SOGo
    item.deleteProperty("X-MOZ-SEND-INVITATIONS");

    let notifyCheckbox = document.getElementById("notify-attendees-checkbox");
    if (notifyCheckbox.checked == true) {
        item.deleteProperty("X-SOGo-Send-Appointment-Notifications");
    } else {
        item.setProperty("X-SOGo-Send-Appointment-Notifications", "NO");
    }
    
    return item;
}

function SIUpdateAttendees() {
    SIOldUpdateAttendees();

    let prefService = (Components.classes["@mozilla.org/preferences-service;1"]
  		       .getService(Components.interfaces.nsIPrefBranch));
    
    let b = false;

    try {
        b = prefService.getBoolPref("sogo-integrator.disable-send-invitations-checkbox");
    } catch (e) {}

    if (b != true) {
        enableElement("notify-attendees-checkbox");
    }
}

window.SIOldOnLoad = onLoad;
window.onLoad = SIOnLoadHandler;
