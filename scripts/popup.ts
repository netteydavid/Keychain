"use strict";

import { bip32 } from 'bitcoinjs-lib';
import * as $ from 'jquery';
import { Account } from './models/Account';
import { Settings } from "./models/Settings";
import { Xpub } from './models/Xpub';
import { goto_login, goto_init, goto_home, logout } from "./navigation";

let timeout = null;

const default_settings: Settings = new Settings();

let current_settings: Settings = null;

let accounts: Account[] = [];

let xpubs: Xpub[] = [];

let addr_gap: number = 0;

export function get_settings(){
    return (current_settings != null) ? current_settings : default_settings;
}

export function get_accounts(){
    if (accounts == null || accounts.length < 1){
        accounts.push(new Account("Account"));
        chrome.storage.local.set({ accounts: accounts });
        return accounts;
    }
    else{
        return accounts;
    }
}

export function set_accounts(accts: Account[], callback: Function = null){
    accounts = accts;
    chrome.storage.local.set({ accounts: accounts }, () => {
        if (callback != null) callback();
    });
}

export function get_xpubs(){
    return xpubs;
}

export function set_xpubs(new_xpubs: Xpub[], callback: Function = null){
    xpubs = new_xpubs;
    chrome.storage.local.set({ xpubs }, () => {
        if (callback != null) callback();
    });
}

window.onload = () => {
    $("#clear_btn").on("click", clear_memory);
    window.onclick = () => stay_alive();
    chrome.storage.local.get(["settings", "xpriv", "xpubs", "last_login", "accounts"], (result) => {
        
        if (result.settings != null){
            current_settings = result.settings;
        }
        else{
            current_settings = default_settings;
            chrome.storage.local.set({ settings: current_settings });
        }

        if (result.accounts != null && (result.accounts as Account[]).length > 0){
            accounts = result.accounts;
        }
        else{
            accounts.push(new Account("Account 1"));
        }

        if (result.xpubs != null && (result.xpubs as Xpub[]).length > 0){
            xpubs = result.xpubs;
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
    chrome.storage.local.get(["last_login"], (result) => {
        if (result.last_login != null){
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