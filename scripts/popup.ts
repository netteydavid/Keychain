"use strict";
import * as $ from 'jquery';
import { goto_login, goto_init } from "./navigation";

window.onload = () => {
    $("#clear_btn").on("click", clear_memory);
    chrome.storage.local.get(["xpriv", "settings"], (result) => {
        if (result.xpriv != null){
            goto_login();
            // if (result.settings != null){
    
            // }
            // else{
    
            // }
        }
        else{
            goto_init();
        }
    });
};

function clear_memory(){
  chrome.storage.local.clear();
}