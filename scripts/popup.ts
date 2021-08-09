"use strict";

import * as $ from 'jquery';
import { Settings } from "./models/Settings";
import { goto_login, goto_init, goto_home, logout } from "./navigation";

let timeout = null;

const default_settings: Settings = new Settings();

let current_settings: Settings = null;

export function get_settings(){
    return (current_settings != null) ? current_settings : default_settings;
}

window.onload = () => {
    $("#clear_btn").on("click", clear_memory);
    window.onclick = () => stay_alive();
    chrome.storage.local.get(["settings", "xpriv", "last_login"], (result) => {
        
        if (result.settings != null){
            current_settings = result.settings;
        }

        const settings = get_settings();
        
        if (result.last_login != null 
            && Date.now() - result.last_login < settings.login_timeout * 60000){
            goto_home(settings.advanced);
            stay_alive();
        }
        else if (result.xpriv != null){
            goto_login();
        }
        else{
            goto_init();
        }
    });
};

function stay_alive(){
    const settings: Settings = get_settings();
    chrome.storage.local.get(["last_login"], (results) => {
        if (results.last_login != null){
            let min: number = settings.login_timeout;
            
            if (timeout == null){
                timeout = window.setTimeout(logout, min * 60000);
            }
            else{
                window.clearTimeout(timeout);
                timeout = window.setTimeout(logout, min * 60000);
            }
        }
    });
}

function clear_memory(){
  chrome.storage.local.clear();
}