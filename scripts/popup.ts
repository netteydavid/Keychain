"use strict";

import * as $ from 'jquery';
import { Settings } from "./models/Settings";
import { goto_login, goto_init, goto_home, logout } from "./navigation";

let timeout = null;

const default_settings: Settings = new Settings();

window.onload = () => {
    $("#clear_btn").on("click", clear_memory);
    window.onclick = () => stay_alive();
    chrome.storage.local.get(["xpriv", "xpriv_temp"], (result) => {
        if (result.xpriv_temp != null){
            goto_home();
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
    chrome.storage.local.get(["settings", "xpriv_temp"], (results) => {
        if (results.xpriv_temp != null){
            let min: number = default_settings.login_timeout;
            if (results.settings != null){
                min = (results.settings as Settings).login_timeout;
            }
            
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