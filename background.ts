//TODO: Figure out how to call logout without importing or message send.
//TODO: Figure out how to get the service worker to keep working.

const default_timeout: number = 1;

let last_click: Date;

try {
    chrome.runtime.onMessage.addListener(({type, set_timeout}) => {
        if (type === "set_timeout"){
            const diff = Date.now().valueOf() - last_click.valueOf();
            last_click = new Date(Date.now());
            if (diff >= 60000 || set_timeout){
                chrome.alarms.get("timeout", (alarm) => {
                    if (alarm == null){
                        chrome.storage.local.get(["settings"], (results) => {
                            if (results.settings == null){
                                chrome.alarms.create("timeout", {delayInMinutes: default_timeout});
                            }
                            else{
                                chrome.alarms.create("timeout", {delayInMinutes: results.settings.login_timeout});
                            }
                        });
                    }
                });
            }
        }
        return true;
    });
    
    chrome.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === "timeout"){
            chrome.storage.local.remove("xpriv_temp");
        }
    });
} catch (error) {
    console.log(error);
}